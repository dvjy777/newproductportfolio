#!/usr/bin/env python3
"""Local text editor for the portfolio.

Serves the site at http://localhost:5175 with an edit mode switched on: click
any text on the page, change it, click away, and the change is written back to
index.html. Nothing is committed or pushed; that still happens separately.

Only listens on 127.0.0.1, so it is never reachable from other machines.
"""
import html
import re
import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, 'index.html')
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5175
history = []  # previous versions of index.html, for undo


def script_ranges(src):
    """Spans of index.html that are inside <script> blocks."""
    out, i = [], 0
    while True:
        a = src.find('<script', i)
        if a < 0:
            return out
        a = src.find('>', a) + 1
        b = src.find('</script>', a)
        out.append((a, b))
        i = b + 1


def in_script(pos, ranges):
    return any(a <= pos < b for a, b in ranges)


def js_escape(t):
    return t.replace('\\', '\\\\').replace("'", "\\'")


def html_escape(t):
    return html.escape(t, quote=False)


ENTITY = re.compile(r'&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);')


def decoded_view(src):
    """index.html with entities such as &#8599; read as the characters they stand for,
    plus, for every character, where it starts in the real file."""
    out, starts, i = [], [], 0
    for m in ENTITY.finditer(src):
        for j in range(i, m.start()):
            out.append(src[j]); starts.append(j)
        ch = html.unescape(m.group(0))
        if len(ch) == 1 and ch != m.group(0):
            out.append(ch); starts.append(m.start())
        else:
            for j in range(m.start(), m.end()):
                out.append(src[j]); starts.append(j)
        i = m.end()
    for j in range(i, len(src)):
        out.append(src[j]); starts.append(j)
    starts.append(len(src))
    return ''.join(out), starts


def find_matches(src, old):
    """Every place the on-screen text could come from: {start: (end, context)} in the real file."""
    ranges = script_ranges(src)
    view, starts = decoded_view(src)
    found = {}
    for form in (js_escape(old), old):
        k = 0
        while form:
            p = view.find(form, k)
            if p < 0:
                break
            a, b = starts[p], starts[p + len(form)]
            ctx = 'script' if in_script(a, ranges) else 'html'
            if form == old or ctx == 'script':
                found.setdefault(a, (b, ctx))
            k = p + 1
    return found


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, fmt, *args):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        if self.path.split('?')[0] in ('/', '/index.html'):
            with open(INDEX, encoding='utf-8') as f:
                page = f.read()
            tag = '<script src="/tools/editor.js"></script>'
            cut = page.find('>', page.find('<meta charset')) + 1   # first thing in the page, before the site's own scripts
            page = page[:cut] + '\n' + tag + page[cut:]
            body = page.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def reply(self, code, data):
        body = json.dumps(data).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.headers.get('Origin') not in (None, 'http://localhost:%d' % PORT, 'http://127.0.0.1:%d' % PORT):
            return self.reply(403, {'ok': False, 'error': 'wrong origin'})
        n = int(self.headers.get('Content-Length', 0))
        data = json.loads(self.rfile.read(n) or b'{}')
        with open(INDEX, encoding='utf-8') as f:
            src = f.read()

        if self.path == '/__undo':
            if not history:
                return self.reply(200, {'ok': False, 'error': 'Nothing to undo'})
            with open(INDEX, 'w', encoding='utf-8') as f:
                f.write(history.pop())
            return self.reply(200, {'ok': True})

        if self.path != '/__save':
            return self.reply(404, {'ok': False})
        old, new = data.get('old', ''), data.get('new', '')
        if not old.strip():
            return self.reply(200, {'ok': False, 'error': 'Empty text'})
        found = find_matches(src, old)
        if not found:
            return self.reply(200, {'ok': False, 'error': "Couldn't find this text in index.html"})
        if len(found) > 1:
            # the same words appear in several places; the surrounding text picks the right one
            before = data.get('before', '').strip()[-24:]
            narrowed = {p: v for p, v in found.items()
                        if before and (before in src[max(0, p - 300):p].replace("\\'", "'")
                                       or html_escape(before) in src[max(0, p - 300):p])}
            if len(narrowed) == 1:
                found = narrowed
            else:
                return self.reply(200, {'ok': False, 'error': 'This text appears %d times in index.html, so ask Claude to change it' % len(found)})
        pos, (end, ctx) = next(iter(found.items()))
        enc = js_escape(new) if ctx == 'script' else html_escape(new)
        history.append(src)
        src = src[:pos] + enc + src[end:]
        with open(INDEX, 'w', encoding='utf-8') as f:
            f.write(src)
        line = src.count('\n', 0, pos) + 1
        return self.reply(200, {'ok': True, 'line': line})


if __name__ == '__main__':
    print('Editor running at http://localhost:%d' % PORT)
    ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
