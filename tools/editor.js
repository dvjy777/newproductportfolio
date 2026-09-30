// Edit mode for the local editor (tools/edit-server.py). Loaded only by that
// server, never by the live site. Click text, change it, click away to save.
(function(){
  // Motion off while editing: the intro sentence and ethos lines stay plain,
  // readable text instead of animated letter spans.
  var realMM = window.matchMedia.bind(window);
  window.matchMedia = function(q){
    if(/prefers-reduced-motion:\s*reduce/.test(q)){
      return { matches:true, media:q, addListener:function(){}, removeListener:function(){}, addEventListener:function(){}, removeEventListener:function(){} };
    }
    return realMM(q);
  };
  window.__EDIT = true;

  var SKIP = 'script,style,svg,canvas,video,noscript,iframe,#__edbar,#__edtoast';
  var INLINE = /^(inline|contents)$/;

  function editableFor(textNode){
    var el = textNode.parentElement;
    if(!el || el.closest(SKIP)) return null;
    while(el.parentElement && el !== document.body && INLINE.test(getComputedStyle(el).display) && el.tagName !== 'BUTTON'){
      el = el.parentElement;
    }
    if(el === document.body || el.tagName === 'BUTTON' || el.closest('button')) return null;
    return el;
  }

  function scan(){
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var n;
    while((n = walker.nextNode())){
      if(!n.nodeValue.trim()) continue;
      var el = editableFor(n);
      if(!el || el.isContentEditable) continue;
      el.setAttribute('contenteditable', 'plaintext-only');
      el.setAttribute('spellcheck', 'true');
      el.classList.add('__ed');
    }
  }

  function textNodes(root){
    var out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n;
    while((n = w.nextNode())) out.push(n);
    return out;
  }

  // a little of the page text that comes right before a node, to tell apart
  // words that appear in more than one place
  function textBefore(node){
    var all = textNodes(document.body), i = all.indexOf(node), s = '';
    while(--i >= 0 && s.length < 60){ s = all[i].nodeValue + s; }
    return s.replace(/\s+/g, ' ');
  }

  var toast, bar;
  function say(msg, bad){
    toast.textContent = msg;
    toast.className = bad ? 'bad show' : 'show';
    clearTimeout(say.t);
    say.t = setTimeout(function(){ toast.className = ''; }, bad ? 6000 : 1800);
  }

  function save(el){
    var snap = el.__snap || [];
    el.__snap = null;
    var whole = el.__whole; el.__whole = null;
    var jobs;
    if(snap.every(function(s){ return s[0].isConnected; })){
      jobs = snap.filter(function(s){ return s[0].nodeValue !== s[1]; })
        .map(function(s){ return { node:s[0], old:s[1], now:s[0].nodeValue }; });
    }else if(!el.children.length || snap.length === 1){
      // retyping replaced the text itself, so compare the whole line
      if(el.textContent === whole) return;
      jobs = [{ node:null, old:whole, now:el.textContent }];
    }else{
      say('That edit spanned styled words. Undo it with Esc and edit a smaller piece, or ask Claude.', true);
      return;
    }
    if(!jobs.length) return;
    jobs.reduce(function(chain, s){
      return chain.then(function(){
        return fetch('/__save', {
          method:'POST', headers:{ 'Content-Type':'application/json' },
          body:JSON.stringify({ old:s.old, new:s.now, before:s.node ? textBefore(s.node) : textBefore(textNodes(el)[0] || el) })
        }).then(function(r){ return r.json(); }).then(function(res){
          if(res.ok){
            el.classList.add('__saved'); setTimeout(function(){ el.classList.remove('__saved'); }, 900);
            say('Saved to index.html (line ' + res.line + ')');
          }else{
            if(s.node) s.node.nodeValue = s.old; else el.textContent = s.old;
            el.classList.add('__failed'); setTimeout(function(){ el.classList.remove('__failed'); }, 1500);
            say(res.error || 'Could not save', true);
          }
        });
      });
    }, Promise.resolve()).catch(function(){ say('The editor server is not running', true); });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var st = document.createElement('style');
    st.textContent =
      '.__ed{ outline:1px dashed transparent; outline-offset:3px; border-radius:2px; transition:outline-color .15s, background .3s; cursor:text; }' +
      '.__ed:hover{ outline-color:rgba(29,95,255,.45); }' +
      '.__ed:focus{ outline:2px solid #1d5fff; background:rgba(29,95,255,.05); }' +
      '.__ed.__saved{ outline:2px solid #1f9d55 !important; background:rgba(31,157,85,.08); }' +
      '.__ed.__failed{ outline:2px solid #c62828 !important; background:rgba(198,40,40,.08); }' +
      '.ethos-line{ grid-area:auto !important; font-size:20px; opacity:1 !important; } .ethos-line .w{ opacity:1 !important; filter:none !important; transform:none !important; }' +
      '.thumb-hover:focus-within, .thumb:focus-within .thumb-hover{ opacity:1 !important; }' +
      '#__edbar{ position:fixed; left:16px; bottom:16px; z-index:99999; display:flex; gap:10px; align-items:center;' +
      '  font:12px/1.3 "Geist Mono", Menlo, monospace; letter-spacing:.03em; color:#fff; background:#14213d;' +
      '  padding:9px 10px 9px 14px; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,.25); max-width:calc(100vw - 32px); }' +
      '#__edbar b{ color:#8fb0ff; font-weight:600; }' +
      '#__edbar button{ font:inherit; color:#14213d; background:#fff; border:0; border-radius:6px; padding:5px 9px; cursor:pointer; }' +
      '#__edtoast{ position:fixed; left:16px; bottom:64px; z-index:99999; font:12.5px/1.4 -apple-system, sans-serif; color:#fff; background:#1f9d55;' +
      '  padding:8px 12px; border-radius:8px; opacity:0; transform:translateY(6px); transition:.2s; pointer-events:none; max-width:420px; }' +
      '#__edtoast.show{ opacity:1; transform:none; } #__edtoast.bad{ background:#c62828; }';
    document.head.appendChild(st);

    bar = document.createElement('div'); bar.id = '__edbar';
    bar.innerHTML = '<span><b>EDIT MODE</b> · click text to edit · Enter or click away saves · Esc cancels · ⌘-click follows links</span>' +
      '<button type="button" id="__undo">Undo</button><button type="button" id="__reload">Reload</button>';
    document.body.appendChild(bar);
    toast = document.createElement('div'); toast.id = '__edtoast'; document.body.appendChild(toast);

    document.getElementById('__undo').addEventListener('click', function(){
      fetch('/__undo', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:'{}' })
        .then(function(r){ return r.json(); })
        .then(function(res){ if(res.ok) location.reload(); else say(res.error, true); });
    });
    document.getElementById('__reload').addEventListener('click', function(){ location.reload(); });

    scan();
    var pending;
    new MutationObserver(function(){ clearTimeout(pending); pending = setTimeout(scan, 250); })
      .observe(document.body, { childList:true, subtree:true });

    document.addEventListener('focusin', function(e){
      var el = e.target.closest && e.target.closest('.__ed');
      if(el && !el.__snap){ el.__snap = textNodes(el).map(function(n){ return [n, n.nodeValue]; }); el.__whole = el.textContent; }
    });
    document.addEventListener('focusout', function(e){
      var el = e.target.closest && e.target.closest('.__ed');
      if(el) save(el);
    });
    document.addEventListener('keydown', function(e){
      var el = e.target.closest && e.target.closest('.__ed');
      if(!el) return;
      if(e.key === 'Enter'){ e.preventDefault(); el.blur(); }
      if(e.key === 'Escape'){
        var sn = el.__snap || [];
        if(sn.every(function(s){ return s[0].isConnected; })) sn.forEach(function(s){ s[0].nodeValue = s[1]; });
        else if(el.__whole != null) el.textContent = el.__whole;
        el.__snap = null; el.__whole = null; el.blur();
      }
    }, true);
    // links and cards stay put while editing; hold ⌘ (or Ctrl) to follow them
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a');
      var el = e.target.closest && e.target.closest('.__ed');
      if(!a || !el) return;
      e.preventDefault();
      if(e.metaKey || e.ctrlKey){
        if(a.target === '_blank') window.open(a.href, '_blank', 'noopener');
        else location.href = a.href;
      }
    }, true);
  });
})();
