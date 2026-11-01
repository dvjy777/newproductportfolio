/* Content for the Chance AI prototype. Copy marked "Figma" is taken from the design file. */
window.CHANCE_DATA = (() => {
  // Where the main object sits in each photo, as [x, y, w, h] fractions of the image.
  const SCENES = {
    bottle:   { img: 'bottle',   label: 'Water bottle',      box: [.343, .05, .342, .9],  learn: 'bottle' },
    chair:    { img: 'chair',    label: 'Bentwood chair',    box: [.314, .22, .347, .46], learn: 'chair' },
    coffee:   { img: 'coffee',   label: 'Coffee & croissant', box: [.384, .30, .237, .52], learn: 'coffee' },
    desk:     { img: 'desk',     label: 'Table lamp',        box: [.438, .38, .31, .33],  learn: 'lamp' },
    sneakers: { img: 'sneakers', label: 'Sneakers & denim',  box: [.384, .38, .219, .36], rating: 'ootd' },
    coat:     { img: 'coat',     label: 'Camel coat',        box: [.369, .17, .248, .77], rating: 'wardrobe' },
    taste:    { img: 'taste',    label: 'Ramen bowl',        box: [.334, .34, .331, .32], rating: 'plate' },
    tarot:    { img: 'tarot',    label: 'Tarot card',        box: [.362, .23, .269, .6] },
    art:      { img: 'art',      label: 'Dot painting',      box: [.334, .29, .328, .45], learn: 'art' },
  };
  const GALLERY = ['bottle', 'coat', 'coffee', 'chair', 'sneakers', 'desk', 'taste', 'tarot', 'art'];

  const LEARN = {
    bottle: { // Figma: Results (Learn) + Chat (Ask)
      thumb: 'bottle-thumb', name: 'Lululemon Back to Life Sport Bottle', meta: 'Starch Blue · 24 oz · straw lid', price: '$44–48',
      match: 'Exact match', store: true, noun: 'bottle',
      pills: ['Find it in Starch Blue', 'Is $48 worth it?', 'How to clean it'],
      eyebrow: 'Seeing the Unseen', headline: 'Hydration at the Desk',
      body: 'The matte finish and textured lid are made for grip. It reads as part of a study setup.',
      more: 'The loop on the lid is sized for two fingers, so it carries like a mug handle. The tinted body shows how much is left, a small nudge to refill.',
      similar: [{ img: 'sim-blue', name: 'Clear glass, white cap' }, { img: 'sim-pastel', name: 'Blush steel' }, { img: 'sim-neutral', name: 'Glass, bamboo lid' }],
      asks: ['How can I use this item daily?', 'Help me find another color.', 'Is $48 worth it?', 'How to clean it'],
      qa: {
        'How can I use this item daily?': { b: ['Keep it on your desk as a refill reminder: at 24 oz, about three refills gets you to 2 litres a day.', 'The straw lid opens one-handed, so you can sip while you type or walk.'], src: 'From the product page · 24 oz · straw lid' },
        'Find it in Starch Blue': { b: ['Starch Blue is the exact color in your photo, and the 24 oz straw-lid version is the match.', 'Colors rotate by season, so tap Store to see what’s in stock now.'], src: 'Matched from your photo' },
        'Help me find another color.': { b: ['New colors come out each season. Tap Store and filter by 24 oz so the lid matches.', 'Want a softer look? The blush and clear bottles under Similar vibe use the same straw-lid idea.'], src: 'From the product listing' },
        'Is $48 worth it?': { b: ['You’re paying for the brand and the leak-proof straw lid. Plain straw-lid bottles this size often cost $15–30.', 'If it rides in your bag every day, the lid earns it. If it stays on a desk, a cheaper one does the same job.'], src: 'Price range from current listings' },
        'How to clean it': { b: ['Pull the straw out and wash it in warm soapy water; a thin straw brush clears the inside.', 'Hand-wash the lid and let the parts dry apart so moisture doesn’t get trapped.'], src: 'General care for straw lids' },
      },
    },
    chair: {
      name: 'Bentwood café chair', meta: 'Steam-bent beech · round seat · 1859 design', price: 'From $180', match: 'Close match', noun: 'chair',
      pills: ['Who designed it?', 'Original or copy?', 'Where to buy one'],
      eyebrow: 'Design Has Reasons', headline: 'Bent, not carved',
      body: 'Each curve is a solid beech rod softened with steam and bent around a mold. Fewer joints meant a light chair that was cheap to make.',
      more: 'The classic version is six bent parts, ten screws and two nuts. Shipped flat, 36 of them fit in a one-cubic-metre crate, which is how this chair ended up in cafés everywhere.',
      qa: {
        'Who designed it?': { b: ['The shape comes from Michael Thonet’s workshop in Vienna, which launched the No. 14 chair in 1859.', 'Thonet’s real invention was the bending process, which let a factory make the same chair fast and cheaply.'], src: 'Design history' },
        'Original or copy?': { b: ['Flip it over: originals and licensed versions usually carry a maker’s stamp or paper label under the seat.', 'Count the parts. Copies often add braces or glue joints where the original uses screws.'], src: 'Collector tips' },
        'Where to buy one': { b: ['New ones are still made under license, and vintage ones turn up at flea markets and auction sites.', 'Expect to pay more for an old one with a cane seat in good shape.'], src: 'Buying guide' },
      },
    },
    coffee: {
      name: 'Flat white & butter croissant', meta: 'Café breakfast · about 400 kcal', price: '$9–12', match: 'Close match', noun: 'breakfast',
      pills: ['Flat white vs latte?', 'Make croissants at home', 'A lighter swap'],
      eyebrow: 'Taste Notes', headline: 'Why the foam is so thin',
      body: 'A flat white uses steamed milk with only a thin layer of microfoam, so the espresso stays up front. The croissant needs a lot of butter to puff.',
      more: 'Croissant dough is folded around a slab of cold butter again and again. In the oven, water in the butter turns to steam and pushes the thin layers apart.',
      qa: {
        'Flat white vs latte?': { b: ['A flat white is smaller, with less milk and a thinner layer of foam, so it tastes stronger.', 'A latte has more milk and a little more foam, so it’s milder and creamier.'], src: 'Café basics' },
        'Make croissants at home': { b: ['Plan for two days: make the dough, chill it, then fold in cold butter three times.', 'Keep everything cold. If the butter melts into the dough, you lose the layers.'], src: 'Home baking' },
        'A lighter swap': { b: ['Swap the croissant for sourdough toast with ricotta or eggs to cut the butter.', 'Ask for a smaller flat white with skim or oat milk for fewer calories.'], src: 'Nutrition estimate' },
      },
    },
    lamp: {
      name: 'Mushroom table lamp', meta: 'Opal-white shade · table lamp · 1970s shape', price: '$60–250', match: 'Close match', noun: 'lamp',
      pills: ['Who made this shape?', 'Best bulb for it', 'Cheaper look-alikes'],
      eyebrow: 'Design Has Reasons', headline: 'Why the shade is a dome',
      body: 'The wide dome hides the bulb from every angle you’d sit at, so you get glow without glare. Light falls down onto the desk and the books.',
      more: 'Mushroom lamps took off in the late 1960s and 70s, when makers could mold glass and plastic into one smooth shape. The lamp reads as an object first and a light second.',
      qa: {
        'Who made this shape?': { b: ['Many designers made mushroom lamps in the 60s and 70s, so the shape alone doesn’t point to one maker.', 'Check the base for a label. Brand, country and material narrow it down fast.'], src: 'Design history' },
        'Best bulb for it': { b: ['Use a warm white bulb, around 2700K, so the shade glows soft instead of blue.', 'A frosted bulb avoids a bright hot spot showing through the shade.'], src: 'Lighting basics' },
        'Cheaper look-alikes': { b: ['Search “mushroom lamp” in opal glass or white acrylic; many versions cost under $80.', 'Pick a shade wide enough to hide the bulb, since that’s what makes the glow work.'], src: 'Shopping tips' },
      },
    },
    art: {
      name: 'Spot painting study', meta: 'Acrylic on canvas · grid of dots', price: '', match: 'Similar style', noun: 'painting',
      pills: ['How do I make one?', 'Why use a grid?', 'Colors in this'],
      eyebrow: 'Seeing the Unseen', headline: 'A grid that keeps your eye moving',
      body: 'The dots sit on a strict grid, but no color repeats in a neat pattern. Your eye keeps hopping, looking for an order that isn’t there.',
      more: 'A grid takes the guesswork out of placement and puts every decision into color. The loose dots on the floor read like spare paint, a hint of the hand behind a very tidy surface.',
      qa: {
        'How do I make one?': { b: ['Pencil a square grid on the canvas, then trace circles with a coin or a circle stencil.', 'Fill each dot with a flat coat, picking colors in random order so no pattern shows.'], src: 'Studio tips' },
        'Why use a grid?': { b: ['A grid makes every dot equal, so color is the only thing that changes.', 'It reads calm from far away and busy up close.'], src: 'Art basics' },
        'Colors in this': { b: ['Mustard, brick red, cobalt blue and sage green, all slightly muted.', 'Want exact hex codes? Make a Palette Pull skill and snap this again.'], src: 'Read from your photo' },
      },
    },
  };

  const RATING = {
    wardrobe: {
      eyebrow: 'Your look', score: 8.4, verdict: 'Polished casual',
      summary: 'The camel coat does most of the work. White sneakers keep it relaxed.',
      bars: [['Fit', 9], ['Color', 8], ['Occasion', 8]], extra: { shoes: ['Shoes', 7], acc: ['Accessories', 6] },
      tips: ['Roll the sleeves once to show a bit of wrist and make the coat look less formal.', 'Swap the white sneakers for brown loafers if you’re heading to dinner.', 'Add a scarf in rust or olive to pick up the camel tone.'],
      short: ['Roll the sleeves once.', 'Loafers for dinner.', 'Add a rust or olive scarf.'],
      casual: 'Weekend idea: the same coat over a grey hoodie and straight jeans.',
      season: 'On colder days, layer a fine-knit turtleneck under the coat.',
      shoeTip: 'Shoes: clean white leather works. Scuffed soles would pull it down.',
      accTip: 'Accessories: a brown leather belt and watch would tie it together.',
    },
    ootd: {
      eyebrow: 'Your look', score: 7.6, verdict: 'Easy weekend',
      summary: 'Light denim and worn-in white sneakers. Relaxed and easy to wear.',
      bars: [['Fit', 7], ['Color', 8], ['Comfort', 9]], extra: { shoes: ['Shoes', 7], acc: ['Accessories', 6] },
      tips: ['Clean the sneaker midsoles. Bright white makes the whole look sharper.', 'Cuff the jeans once so the shoes show.', 'A cream canvas tote ties the colors together.'],
    },
    plate: {
      eyebrow: 'Your plate', score: 7.2, verdict: 'Comforting, light on greens',
      summary: 'A warm bowl with good protein from the egg. Greens would round it out.',
      bars: [['Protein', 8], ['Veggies', 5], ['Portion', 7]],
      tips: ['Add a handful of spinach or bok choy right before serving.', 'Leave some of the broth to cut the salt.', 'The soft egg is a good call. Keep it.'],
    },
    room: {
      eyebrow: 'Your space', score: 8.1, verdict: 'Calm and warm',
      summary: 'Soft light, warm wood and a few books. It feels lived in, not styled.',
      bars: [['Light', 9], ['Balance', 8], ['Clutter', 7]],
      tips: ['Stack the books with spines facing out so their colors show.', 'Add one small plant on the left to balance the lamp.', 'A linen runner would soften the wood edge.'],
    },
  };

  const steps = (a) => a.concat(['Finalizing result page']);
  const CATS = {
    fashion: { label: 'Fashion', img: 'coat', ideas: ['Style Finder', 'Fit Check', 'Closet Planner'], tools: [
      { id: 'rater', name: 'Outfit Rater', desc: 'Outfit → a rating and quick tips', icon: 'shirt', img: 'coat',
        skill: { name: 'Wardrobe Analyzer', desc: 'Rate your current wardrobe selections and get advice for improvements.', short: 'Outfit → rating & tips', kind: 'rating', result: 'wardrobe', scene: 'coat', steps: steps(['Setting rating criteria', 'Designing the result card', 'Writing improvement tips']) } },
      { id: 'color', name: 'Color Match', desc: 'Clothes → colors that go with them', icon: 'dots', img: 'sneakers',
        skill: { name: 'Palette Matcher', desc: 'Snap any piece of clothing and see the colors that go with it.', short: 'Clothes → matching colors', kind: 'palette', scene: 'sneakers', steps: steps(['Reading fabric colors', 'Building color pairings', 'Designing the palette card']) } },
    ] },
    food: { label: 'Food', img: 'coffee', ideas: ['Recipe Finder', 'Wine Pairing', 'Calorie Glance'], tools: [
      { id: 'plate', name: 'Plate Check', desc: 'Meal → a balance score and swaps', icon: 'utensils', img: 'taste',
        skill: { name: 'Balanced Plate', desc: 'Snap a meal to see how balanced it is and what to add.', short: 'Meal → balance & swaps', kind: 'rating', result: 'plate', scene: 'taste', steps: steps(['Setting balance criteria', 'Designing the score card', 'Writing simple swaps']) } },
      { id: 'cafe', name: 'Café Guide', desc: 'Drink or pastry → what’s in it', icon: 'bulb', img: 'coffee',
        skill: { name: 'Café Decoder', desc: 'Snap a café order to learn what’s in it and how it’s made.', short: 'Café order → what’s in it', kind: 'learn', scene: 'coffee', steps: steps(['Learning café drinks', 'Designing the explainer card', 'Writing quick facts']) } },
    ] },
    interiors: { label: 'Interiors', img: 'chair', ideas: ['Plant Doctor', 'Layout Helper', 'Paint Picker'], tools: [
      { id: 'room', name: 'Room Rater', desc: 'A corner → a style score and fixes', icon: 'house', img: 'desk',
        skill: { name: 'Room Refresh', desc: 'Rate a corner of your room and get small fixes that make it feel finished.', short: 'Room → score & fixes', kind: 'rating', result: 'room', scene: 'desk', steps: steps(['Setting style criteria', 'Designing the score card', 'Writing small fixes']) } },
      { id: 'style', name: 'Style Spotter', desc: 'Furniture → its style and era', icon: 'bulb', img: 'chair',
        skill: { name: 'Design Detective', desc: 'Snap a piece of furniture to learn its style, era and story.', short: 'Furniture → style & story', kind: 'learn', scene: 'chair', steps: steps(['Learning design eras', 'Designing the story card', 'Writing quick facts']) } },
    ] },
    art: { label: 'Art', img: 'art', ideas: ['Sketch Coach', 'Museum Notes', 'Style Mixer'], tools: [
      { id: 'explain', name: 'Art Explainer', desc: 'Artwork → the story and technique', icon: 'bulb', img: 'art',
        skill: { name: 'Gallery Guide', desc: 'Snap an artwork to learn how it was made and why it works.', short: 'Artwork → story & technique', kind: 'learn', scene: 'art', steps: steps(['Learning art techniques', 'Designing the story card', 'Writing quick facts']) } },
      { id: 'palette', name: 'Palette Pull', desc: 'Any photo → its color palette', icon: 'dots', img: 'desk',
        skill: { name: 'Palette Pull', desc: 'Pull the color palette out of any photo, with hex codes.', short: 'Photo → color palette', kind: 'palette', scene: 'art', steps: steps(['Reading colors', 'Grouping shades', 'Designing the palette card']) } },
    ] },
  };

  const LABELS = { fashion: 'Fashion', food: 'Food', interiors: 'Interiors', pets: 'Pets', travel: 'Travel', art: 'Art', cars: 'Cars', plants: 'Plants', design: 'Design', coffee: 'Coffee', sneakers: 'Sneakers', tarot: 'Tarot', gadgets: 'Gadgets' };
  const CAT_IMG = { fashion: 'coat', food: 'coffee', interiors: 'chair', pets: '', travel: '', art: 'art', cars: '', plants: 'desk', design: 'chair', coffee: 'coffee', sneakers: 'sneakers', tarot: 'tarot', gadgets: 'gadgets' };
  const INTERESTS = ['fashion', 'food', 'interiors', 'pets'];
  const MORE_INTERESTS = ['travel', 'art', 'cars', 'plants'];
  const TOPICS = ['art', 'design', 'coffee', 'sneakers', 'tarot', 'gadgets'];
  const ALL_TOPICS = ['art', 'design', 'coffee', 'sneakers', 'tarot', 'gadgets', 'fashion', 'food', 'interiors', 'plants', 'travel', 'cars', 'pets'];
  const TOPIC_WORDS = [
    [/camera|film|photo|lens/, ['gadgets', 'design']], [/plant|garden|flower|leaf/, ['plants', 'interiors']],
    [/watch|clock|jewel/, ['gadgets', 'fashion']], [/sign|street|city|font|type/, ['design', 'art']],
    [/bird|animal|dog|cat|pet/, ['pets', 'art']], [/coffee|tea|food|cook|bake|wine/, ['coffee', 'food']],
    [/shoe|sneaker|cloth|wear|outfit/, ['sneakers', 'fashion']], [/car|bike|motor/, ['cars', 'design']],
    [/paint|draw|art|museum/, ['art', 'design']], [/card|tarot|astro|star/, ['tarot', 'art']],
  ];

  const HOME_SKILLS = [
    { id: 'tarot', name: 'Daily Tarot', img: 'tarot', pos: '50% 46%' },
    { id: 'ootd', name: 'OOTD Fitchecker', img: 'coat', pos: '50% 42%' },
    { id: 'minion', name: 'Minion Buddy', img: 'gadgets', pos: '30% 52%' },
  ];
  const CATALOG = [
    { id: 'ootd', name: 'OOTD Fitchecker', desc: 'Outfit → feedback on the fit', img: 'coat', icon: 'shirt', tag: 'Style' },
    { id: 'design', name: 'Design Has Reasons', desc: 'Object → the story behind it', img: 'chair', icon: 'bulb', tag: 'Design' },
    { id: 'minion', name: 'Minion Buddy', desc: 'Any photo → a Minion take on it', img: 'gadgets', icon: 'glasses', tag: 'Just for fun' },
    { id: 'tarot', name: 'Daily Tarot', desc: 'Any photo → today’s card', img: 'tarot', icon: 'moon', tag: 'Just for fun', pro: true },
  ];
  const MORE_SKILLS = [
    { id: 'dot', name: 'Dot Your Photo', desc: 'Any photo → a dot-art remix', img: 'art', icon: 'dots', tag: 'Just for fun' },
    { id: 'taste', name: 'Taste Notes', desc: 'A dish → what’s in it', img: 'taste', icon: 'utensils', tag: 'Food' },
  ];
  const MODES = [
    { id: 'snap', label: 'Snap to know', name: 'Snap to know', icon: 'target', kind: 'learn', scene: 'bottle' },
    { id: 'design', label: 'Design', name: 'Design Has Reasons', icon: 'bulb', kind: 'learn', scene: 'chair' },
    { id: 'taste', label: 'Taste', name: 'Taste Notes', icon: 'utensils', kind: 'learn', scene: 'coffee' },
    { id: 'ootd', label: 'Fit check', name: 'OOTD Fitchecker', icon: 'shirt', kind: 'rating', result: 'ootd', scene: 'sneakers' },
    { id: 'tarot', label: 'Tarot', name: 'Daily Tarot', icon: 'moon', kind: 'tarot', scene: 'tarot' },
    { id: 'dot', label: 'Dot art', name: 'Dot Your Photo', icon: 'dots', kind: 'dot', scene: 'desk' },
  ];
  const OWN_PHOTOS = ['coat', 'sneakers', 'desk', 'coffee', 'chair', 'hero-chair'];
  const CHANGES = [
    [/casual|weekend|relax/, 'Outfit ideas', 'casual'], [/shoe|sneaker|boot|loafer/, 'Shoe rating', 'shoes'],
    [/accessor|bag|jewel|scarf|watch|belt/, 'Accessories', 'acc'], [/short|brief|concise|quick/, 'Shorter tips', 'short'],
    [/season|weather|winter|summer|cold|rain/, 'Seasonal advice', 'season'], [/colou?r/, 'Color advice', 'color'],
    [/date|work|office|occasion|dinner|party/, 'Occasion tips', 'occasion'],
  ];

  /* Figma "Oct 30 Home Screen Redesign + Community Tab" (Home · Hi-fi, Community · Hi-fi).
     Skills people share. Trying one adds it to your camera's skill row. */
  const SHOWCASE = {
    'sc-wardrobe': { id: 'sc-wardrobe', name: 'Wardrobe Analyzer', desc: 'Rate your current wardrobe selections and get advice for improvements.', short: 'Outfit → rating & tips', icon: 'shirt', img: 'coat', kind: 'rating', result: 'wardrobe', scene: 'coat' },
    'sc-coffee': { id: 'sc-coffee', name: 'Coffee Origin Guide', desc: 'Snap a coffee to learn where it comes from and how it’s made.', short: 'Coffee → where it’s from', icon: 'utensils', img: 'coffee', kind: 'learn', scene: 'coffee' },
    'sc-study': { id: 'sc-study', name: 'Study Space Rater', desc: 'Rate your study spot and get small fixes that help you focus.', short: 'Desk → a study-space score', icon: 'house', img: 'desk', kind: 'rating', result: 'room', scene: 'desk' },
    'sc-cafe': { id: 'sc-cafe', name: 'Cafe Menu Decoder', desc: 'Snap a café order to learn what’s in it and how it’s made.', short: 'Café order → what’s in it', icon: 'utensils', img: 'coffee', kind: 'learn', scene: 'coffee' },
    'sc-gallery': { id: 'sc-gallery', name: 'Gallery Notes', desc: 'Snap an artwork to learn how it was made and why it works.', short: 'Artwork → story & technique', icon: 'bulb', img: 'art', kind: 'learn', scene: 'art' },
    'sc-remix': { id: 'sc-remix', name: 'Outfit Remixer', desc: 'Snap an outfit and get a new way to wear the same pieces.', short: 'Outfit → a fresh way to wear it', icon: 'shirt', img: 'sneakers', kind: 'rating', result: 'ootd', scene: 'sneakers' },
    'sc-plant': { id: 'sc-plant', name: 'Plant ID Buddy', desc: 'Snap a plant to learn what it is and how to keep it happy.', short: 'Plant → name & care', icon: 'bulb', img: 'desk', kind: 'learn', scene: 'desk', gallery: true },
  };
  const HOME_RECENT_SHOT = { img: 'coat', sk: 'sc-wardrobe' };
  const HOME_RECENTS = [
    { sk: 'sc-wardrobe', thumb: 'coat', when: 'Used 2h ago' },
    { sk: 'sc-coffee', thumb: 'coffee', when: 'Used yesterday' },
  ];
  // Rank is based on likes received.
  const TOP_SKILLS = [
    { sk: 'sc-wardrobe', img: 'coat', av: 'img/fig-av-1.png', likes: '2.4k' },
    { sk: 'sc-study', img: 'chair', av: 'img/fig-av-2.png', likes: '1.9k' },
    { sk: 'sc-cafe', img: 'coffee', av: 'img/fig-av-3.png', likes: '1.6k' },
    { sk: 'sc-gallery', img: 'art', av: 'img/fig-av-4.png', likes: '1.2k' },
  ];
  const COMMUNITY_FILTERS = ['For you', 'Trending', 'Fashion', 'Food', 'Interiors'];
  // col and h are the masonry layout from Figma (For you); other filters re-flow by height.
  const COMMUNITY = [
    { user: 'mina.k', init: 'M', color: '#1631f3', img: 'coat', thumb: 'tarot', sk: 'sc-wardrobe', likes: 248, h: 240, col: 0, tags: ['Fashion'] },
    { user: 'jun.eats', init: 'J', color: '#0b0b0d', img: 'coffee', thumb: 'gadgets', sk: 'sc-cafe', likes: 193, h: 200, col: 0, tags: ['Food'] },
    { user: 'sora.draws', init: 'S', color: '#9a7700', img: 'art', thumb: 'desk', sk: 'sc-gallery', likes: 121, h: 230, col: 0, tags: [] },
    { user: 'lena.home', init: 'L', color: '#b23535', img: 'chair', thumb: 'sneakers', sk: 'sc-study', likes: 310, h: 196, col: 1, tags: ['Interiors'] },
    { user: 'dani.fits', init: 'D', color: '#5b5752', img: 'sneakers', thumb: 'coat', sk: 'sc-remix', likes: 176, h: 250, col: 1, tags: ['Fashion'] },
    { user: 'rio.walks', init: 'R', color: '#1631f3', img: 'hero-chair', thumb: 'coffee', sk: 'sc-plant', likes: 88, h: 220, col: 1, tags: ['Interiors'] },
  ];

  return { SCENES, GALLERY, LEARN, RATING, CATS, LABELS, CAT_IMG, INTERESTS, MORE_INTERESTS, TOPICS, ALL_TOPICS, TOPIC_WORDS, HOME_SKILLS, CATALOG, MORE_SKILLS, MODES, OWN_PHOTOS, CHANGES, SHOWCASE, HOME_RECENT_SHOT, HOME_RECENTS, TOP_SKILLS, COMMUNITY_FILTERS, COMMUNITY };
})();
