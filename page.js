/* Work portfolio, concept 7 (Dial): everything on the page is rendered from shared/data.js */
(() => {
  const DATA = window.PF_DATA || [];
  const FEAT = window.PF_FEAT || [];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const host = (u) => (u || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = (s) => (!s ? '' : s.length >= 7 ? MON[+s.slice(5, 7) - 1] + ' ' + s.slice(0, 4) : s.slice(0, 4));
  const clean = (n) => n.replace(' (flagship)', '');
  const FIRST = 2014;
  const PAGE = Infinity;
  const STATUS = { live: 'Live', active: 'Live', dev: 'In progress', internal: 'Product', legacy: 'Completed', oneoff: 'Completed' };
  const SCREENS = {
    'BKB (Bare Knuckle Boxing)': 'bkb', 'CallSource Automotive': 'callsource', 'CarAcquired': 'caracquired',
    'Edible Arrangements (Edible for Business)': 'edible', 'Fast Courier': 'fastcourier',
    "KidsMarket / Children's Entrepreneur Market": 'kidsmarkets', 'LA Injury Attorneys': 'laia',
    'Mark Christopher Fleet': 'mcfleet', 'Pool Express': 'poolexpress', 'Robinson Roofing': 'robinson',
    'Tuttle Twins + Tuttle Twins Academy': 'tuttle', 'Reputation Sensei': 'reputationsensei',
    'All Florida Medical Waste': 'afmw', 'GarageArt': 'garageart', 'Skip the Warehouse': 'skipthewarehouse',
  };
  /* one line for the dial where the data has only a long summary */
  const TAG = {
    'Reputation Sensei': 'Trust Cycle Management platform site for car dealerships, 23 pages',
    'All Florida Medical Waste': 'Medical waste pickup and document shredding across Florida',
    'Skip the Warehouse': 'Building supply store: Doofinder search, MAP and B2B pricing, a 41,000-user import',
  };
  const short = (n) => clean(n).replace(' + Tuttle Twins Academy', '').replace(" / Children's Entrepreneur Market", '').replace(' (Edible for Business)', '').replace(' (Bare Knuckle Boxing)', '').replace('All Florida Medical Waste', 'Florida Medical Waste');
  const featBy = {};
  FEAT.forEach((f) => { featBy[f.name] = f; });
  const byName = {};

  DATA.forEach((d) => {
    d.id = slug(d.name);
    d.key = d.last || d.start || '';
    d.year = Math.max(+d.key.slice(0, 4) || FIRST, FIRST);
    d.host = host(d.url);
    d.feat = featBy[d.name] || null;
    d.hay = [d.name, d.host, d.cat, d.role, d.plugin, d.summary, ...(d.stack || []), ...(d.feat ? d.feat.tech : [])].join(' ').toLowerCase();
    byName[d.name] = d;
  });
  const sorted = DATA.slice().sort((a, b) => (b.key > a.key ? 1 : b.key < a.key ? -1 : a.name.localeCompare(b.name)));

  /* figures, counted from the data */
  const N = {
    total: DATA.length,
    live: DATA.filter((d) => d.status === 'live' || d.status === 'active').length,
    plugins: new Set(DATA.filter((d) => d.plugin).map((d) => d.plugin)).size,
    cats: new Set(DATA.map((d) => d.cat)).size,
    built: DATA.filter((d) => /build|redesign/i.test(d.role)).length,
  };
  $$('[data-n]').forEach((el) => { el.textContent = N[el.dataset.n].toLocaleString('en-US'); });

  /* site links written in the HTML take their URL from the data */
  $$('[data-site]').forEach((a) => { const d = byName[a.dataset.site]; if (d && d.url) a.href = d.url; else a.remove(); });

  /* the dial: fourteen sites on a half circle, turned by scrolling */
  const dialSec = $('[data-dial-section]');
  if (dialSec) {
    const ORDER = ['Edible Arrangements (Edible for Business)', 'Robinson Roofing', 'BKB (Bare Knuckle Boxing)', 'Mark Christopher Fleet', 'Reputation Sensei', 'CallSource Automotive', 'CarAcquired', 'Skip the Warehouse', 'LA Injury Attorneys', 'GarageArt', 'Fast Courier', 'All Florida Medical Waste', 'Pool Express', "KidsMarket / Children's Entrepreneur Market"];
    const sites = ORDER.map((n) => byName[n]).filter(Boolean);
    const n = sites.length;
    const STEP = 20; /* degrees between sites */
    const CX = 800, CY = 820, R = 790;
    dialSec.style.setProperty('--stops', n + 1);
    const svg = $('[data-dial-svg]');
    const pt = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; };
    const f1 = (v) => v.toFixed(1);
    let g = `<circle class="dial__disc" cx="${CX}" cy="${CY}" r="${R}"/><g class="dial__ring" data-ring><defs>`;
    const LR = R - 72, HALF = 9.5; /* label path radius and half-span, degrees */
    sites.forEach((d, i) => {
      const deg = i * STEP;
      const [ax, ay] = pt(deg - HALF, LR), [bx, by] = pt(deg + HALF, LR);
      g += `<path id="dl-${i}" d="M${f1(ax)} ${f1(ay)} A${LR} ${LR} 0 0 1 ${f1(bx)} ${f1(by)}"/>`;
    });
    g += '</defs>';
    for (let d = -100; d <= 360; d += 2) {
      if (d % STEP === 0 && d / STEP >= 0 && d / STEP < n) continue;
      const [x1, y1] = pt(d, R - 6), [x2, y2] = pt(d, R - 22);
      g += `<line class="dial__tick" x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}"/>`;
    }
    sites.forEach((d, i) => {
      const deg = i * STEP;
      const [x1, y1] = pt(deg, R - 4), [x2, y2] = pt(deg, R - 40);
      g += `<line class="dial__tick dial__tick--major" x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}"/>`;
      g += `<text class="dial__label" data-label="${i}"><textPath href="#dl-${i}" startOffset="50%" text-anchor="middle">${esc(short(d.name))}</textPath></text>`;
    });
    g += '</g>';
    svg.innerHTML = g;
    const small = matchMedia('(max-width: 60rem)');
    const frame = () => {
      svg.setAttribute('viewBox', small.matches ? '400 0 800 300' : '0 0 1600 820');
      svg.setAttribute('preserveAspectRatio', small.matches ? 'xMidYMax meet' : 'xMidYMid meet');
    };
    frame(); small.addEventListener('change', frame);
    const ring = $('[data-ring]', svg);
    const labels = $$('[data-label]', svg);
    const shots = $('[data-shots]');
    /* two sites sit behind a bot check my capture cannot pass; their frames are slots until the owner drops the screenshots in */
    const MISSING = new Set();
    shots.innerHTML = sites.map((d, i) => MISSING.has(d.name)
      ? `<div class="dial__slot${i === 0 ? ' on' : ''}" data-shot data-slot="screenshot, 1600 by 1000">Screenshot to come: ${esc(short(d.name))}</div>`
      : `<img data-shot src="shared/screens/${SCREENS[d.name]}.jpg" width="1600" height="1000" alt="${esc(clean(d.name))} home page"${i === 0 ? ' class="on"' : ' loading="lazy"'}>`).join('');
    const imgs = $$('[data-shot]', shots);
    const half = Math.ceil(n / 2);
    const item = (d, i) => `<li><button type="button" data-go="${i}"${i === 0 ? ' aria-current="true"' : ''}>${esc(short(d.name))}</button></li>`;
    $('[data-dial-list="left"]').innerHTML = sites.slice(0, half).map(item).join('');
    $('[data-dial-list="right"]').innerHTML = sites.slice(half).map((d, i) => item(d, i + half)).join('');
    const btns = $$('[data-go]', dialSec);
    const nameEl = $('[data-dial-name]'), subEl = $('[data-dial-sub]'), linksEl = $('[data-dial-links]');
    let cur = -1;
    const show = (i) => {
      if (i === cur) return; cur = i;
      const d = sites[i]; const f = d.feat;
      imgs.forEach((im, k) => im.classList.toggle('on', k === i));
      labels.forEach((l, k) => l.classList.toggle('on', k === i));
      btns.forEach((b) => { if (+b.dataset.go === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      nameEl.textContent = clean(d.name);
      subEl.textContent = (TAG[d.name] || (f ? f.tagline : d.summary)) + '.';
      linksEl.innerHTML = (d.url ? `<a href="${esc(d.url)}" target="_blank" rel="noopener">Visit ${esc(d.host)}</a>` : '') + `<a href="#p-${d.id}" data-open="${d.id}">Open in the list</a>`;
    };
    show(0);
    const vh = () => window.innerHeight;
    let ticking = false;
    const update = () => {
      ticking = false;
      const top = dialSec.offsetTop;
      const span = dialSec.offsetHeight - vh();
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / span));
      const pos = p * (n - 1);
      ring.style.setProperty('--rot', (-pos * STEP).toFixed(2) + 'deg');
      show(Math.round(pos));
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    update();
    dialSec.addEventListener('click', (e) => {
      const b = e.target.closest('[data-go]'); if (!b) return;
      const i = +b.dataset.go;
      const top = dialSec.offsetTop; const span = dialSec.offsetHeight - vh();
      window.scrollTo({ top: top + span * (i / (n - 1)), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  }

  /* the guide: one creature fixed to the screen. Each section marks its blank spots; the guide flies to the first one still on screen and says the section's line */
  const guide = $('[data-guide]');
  let guideStart = () => {};
  if (guide) {
    const line = $('[data-guide-line]', guide);
    const stops = $$('[data-say]').map((p) => { const sec = p.closest('section'); return { sec, spots: () => $$('[data-spot]', sec), text: p.textContent.replace(/\s+/g, ' ').trim() }; });
    const small = matchMedia('(max-width: 60rem)');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const TOP = 96, EDGE = 16;
    let active = -1, lastSpot = null, flyTimer, swapTimer;
    const speak = (text) => {
      clearTimeout(swapTimer);
      if (reduce) { line.textContent = text; return; }
      guide.classList.add('is-swap');
      swapTimer = setTimeout(() => { line.textContent = text; guide.classList.remove('is-swap'); place(); }, 260);
    };
    const fly = () => {
      guide.classList.add('is-flying'); clearTimeout(flyTimer);
      flyTimer = setTimeout(() => guide.classList.remove('is-flying'), 900);
    };
    /* the first spot whose top is still below the nav, else the last one (the guide drifts off with it) */
    const pick = (s) => {
      const bar = s.sec.querySelector('[data-clear]');
      const clear = Math.max(TOP, bar ? bar.getBoundingClientRect().bottom + 8 : 0);
      const list = s.spots(); let sp = list[0], r = sp && sp.getBoundingClientRect();
      for (const el of list) { const rr = el.getBoundingClientRect(); sp = el; r = rr; if (rr.top >= clear) break; }
      return { sp, r, clear, bar, passed: !!r && r.top < clear };
    };
    const place = () => {
      if (active < 0 || small.matches) return;
      const { sp, r, clear, bar, passed } = pick(stops[active]);
      if (!sp) return;
      if (sp !== lastSpot) { if (lastSpot) fly(); lastSpot = sp; }
      guide.style.maxWidth = r.width > 160 ? r.width.toFixed(0) + 'px' : '';
      const gw = guide.offsetWidth;
      const left = sp.dataset.spot === 'left';
      const x = Math.max(EDGE, Math.min(left ? r.left : r.right - gw, innerWidth - gw - EDGE));
      /* below the fold it waits off screen and rises with its spot; in a section with a sticky bar it holds at the clear line once every spot has passed, elsewhere it drifts off with the last spot */
      const y = passed && bar ? clear : r.top;
      /* no bar to hold at: once the last spot slips under the nav the guide fades out until the next stop calls it */
      guide.classList.toggle('is-away', passed && !bar);
      guide.style.setProperty('--gx', x.toFixed(0) + 'px');
      guide.style.setProperty('--gy', y.toFixed(0) + 'px');
    };
    const tick = () => {
      let a = 0;
      const cut = innerHeight * 0.45;
      stops.forEach((s, k) => { if (s.sec.getBoundingClientRect().top <= cut) a = k; });
      /* move on early once this section has no blank spot left on screen and the next one is in view */
      if (a + 1 < stops.length) {
        const { r } = pick(stops[a]);
        if (r && r.top < TOP && stops[a + 1].sec.getBoundingClientRect().top <= innerHeight - 160) a += 1;
      }
      if (a !== active) { active = a; speak(stops[a].text); }
      place();
    };
    let raf = false;
    const onMove = () => { if (!raf) { raf = true; requestAnimationFrame(() => { raf = false; tick(); }); } };
    addEventListener('scroll', onMove, { passive: true });
    addEventListener('resize', onMove);
    guideStart = (fromCentre) => {
      if (fromCentre && !small.matches) {
        guide.style.setProperty('--gx', (innerWidth / 2 - 80).toFixed(0) + 'px');
        guide.style.setProperty('--gy', (innerHeight / 2 - 100).toFixed(0) + 'px');
        guide.classList.add('is-on');
        guide.getBoundingClientRect();
        fly();
      } else guide.classList.add('is-on');
      tick();
    };
  }

  /* the flagship case */
  const caseEl = $('[data-case]');
  if (caseEl) {
    const d = byName[caseEl.dataset.case];
    const f = d && d.feat;
    if (f) {
      $('[data-points]', caseEl).innerHTML = f.points.map((p) => `<li>${esc(p)}</li>`).join('');
      $('[data-tech]', caseEl).innerHTML = f.tech.map((t) => `<span>${esc(t)}</span>`).join('') + (d.url ? `<a href="${esc(d.url)}" target="_blank" rel="noopener">Visit ${esc(d.host)}</a>` : '') + `<a href="#p-${d.id}" data-open="${d.id}">Open in the list</a>`;
    }
  }

  /* custom-code rows, plain */
  const cases = $('[data-cases]');
  if (cases) {
    const picks = ['BKB (Bare Knuckle Boxing)', 'CarAcquired', "KidsMarket / Children's Entrepreneur Market", 'LA Injury Attorneys'];
    cases.innerHTML = picks.map((name) => {
      const d = byName[name]; const f = d.feat;
      return `<li>
        <div class="cases__name"><h3>${esc(clean(d.name))}</h3><span class="spot spot--col" data-spot="left" aria-hidden="true"></span></div>
        <div class="cases__body"><p>${esc(f.tagline)}.</p><p class="point">${esc(f.points[0])}. ${esc(f.points[1])}.</p></div>
        <div class="meta">${d.plugin ? `<span>${esc(d.plugin)}</span>` : ''}<span>${esc(f.tech.join(', '))}</span>${d.url ? `<a href="${esc(d.url)}" target="_blank" rel="noopener">Visit ${esc(d.host)}</a>` : ''}<a href="#p-${d.id}" data-open="${d.id}">Open in the list</a></div>
      </li>`;
    }).join('');
  }

  /* the browser */
  const years = $('[data-years]');
  const tools = $('[data-tools]');
  const count = $('[data-count]');
  if (years && tools) {
    const sel = $('select[name="ind"]', tools);
    [...new Set(DATA.map((d) => d.cat))].sort().forEach((c) => { const o = document.createElement('option'); o.value = c; o.textContent = c; sel.append(o); });

    const groups = {};
    sorted.forEach((d) => { (groups[d.year] = groups[d.year] || []).push(d); });
    const yearsDesc = Object.keys(groups).map(Number).sort((a, b) => b - a);
    years.innerHTML = yearsDesc.map((y) => `<section class="year" id="y-${y}" data-year="${y}" aria-label="${y}">
      <div class="year__head"><b class="num">${y}</b><small data-ycount>${groups[y].length} projects</small><span class="spot spot--col" data-spot="left" aria-hidden="true"></span></div>
      <ol class="rows">${groups[y].map((d) => `<li class="row" id="p-${d.id}" data-id="${d.id}">
        <button class="row__btn" type="button" aria-expanded="false" aria-controls="d-${d.id}">
          <span class="row__name">${esc(clean(d.name))}</span>
          <span class="row__cat">${esc(d.cat)}</span>
          <span class="row__role">${esc(d.role)}</span>
          <span class="row__when">${esc(fmt(d.key))}</span>
        </button>
        <div class="detail" id="d-${d.id}" hidden></div>
      </li>`).join('')}
      <li class="more-wrap"><button class="key key--sm more" type="button" data-more="${y}" hidden>Show all</button></li></ol>
    </section>`).join('') + (() => { let f = FIRST; while (!groups[f] && f < yearsDesc[0]) f++; return f > FIRST ? `<section class="year year--early" id="y-early" aria-label="${FIRST} to ${f - 1}"><div class="year__head"><b class="num">${FIRST} to ${f - 1}</b><span class="spot spot--col" data-spot="left" aria-hidden="true"></span></div><p class="early">Building sites in these years too, just not keeping a list yet. Nothing from before ${f} made it onto this page.</p></section>` : ''; })() + '<p class="empty" data-empty hidden>No project matches that. Clear the search or pick another filter.</p>';

    const rowEls = $$('.row', years);
    const rowOf = {}; rowEls.forEach((r) => { rowOf[r.dataset.id] = r; });
    const expanded = new Set();
    const S = { q: '', type: 'all', ind: '' };
    const isFeat = (d) => !!d.feat;
    const match = (d) => {
      if (S.ind && d.cat !== S.ind) return false;
      if (S.type === 'selected' && !isFeat(d)) return false;
      if (S.type === 'custom' && !(d.plugin || /custom development/i.test(d.role))) return false;
      if (S.type === 'built' && !/build|redesign/i.test(d.role)) return false;
      if (S.type === 'maint' && !/maint/i.test(d.role)) return false;
      if (S.type === 'dev' && d.status !== 'dev') return false;
      if (S.q && !S.q.split(/\s+/).every((w) => d.hay.includes(w))) return false;
      return true;
    };

    const apply = () => {
      let total = 0;
      yearsDesc.forEach((y) => {
        const sec = $(`#y-${y}`);
        const open = expanded.has(y) || !!(S.q || S.type !== 'all' || S.ind);
        let shown = 0, matched = 0;
        groups[y].forEach((d) => {
          const ok = match(d);
          const r = rowOf[d.id];
          if (ok) matched++;
          const show = ok && (open || shown < PAGE);
          if (show) shown++;
          r.hidden = !show;
          if (!show) closeRow(r);
        });
        total += matched;
        sec.hidden = matched === 0;
        $('[data-ycount]', sec).textContent = `${matched} ${matched === 1 ? 'project' : 'projects'}`;
        const more = $('[data-more]', sec);
        more.hidden = matched <= shown;
        more.textContent = `Show all ${matched} from ${y}`;
      });
      $('[data-empty]', years).hidden = total > 0;
      if (count) count.textContent = total === DATA.length ? `${total} projects, newest first` : `${total} of ${DATA.length} projects`;
    };

    const detailHTML = (d) => {
      const f = d.feat; const k = SCREENS[d.name];
      const links = [d.url ? `<a class="key key--sm" href="${esc(d.url)}" target="_blank" rel="noopener">Visit ${esc(d.host)}</a>` : '', ...(d.more || []).map((u) => `<a class="key key--sm" href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a>`)].join('');
      const when = d.start && d.last && d.start !== d.last ? `${fmt(d.start)} to ${fmt(d.last)}` : fmt(d.key);
      return `<div>
        <p>${esc(d.summary)}</p>
        ${f ? `<ul>${f.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
        <div class="links">${links}</div>
      </div>
      <div>
        ${k ? `<figure class="detail__shot"><img src="shared/screens/${k}.jpg" width="1600" height="1000" alt="${esc(clean(d.name))} home page" loading="lazy"></figure>` : ''}
        <dl>
          <dt>Role</dt><dd>${esc(d.role)}</dd>
          <dt>Industry</dt><dd>${esc(d.cat)}</dd>
          <dt>Timeline</dt><dd>${esc(when)}</dd>
          <dt>Status</dt><dd>${esc(STATUS[d.status] || d.status)}</dd>
          ${d.plugin ? `<dt>Custom code</dt><dd>${esc(d.plugin)}</dd>` : ''}
          ${(d.stack && d.stack.length) || f ? `<dt>Stack</dt><dd>${esc([...new Set([...(d.stack || []), ...(f ? f.tech : [])])].join(', '))}</dd>` : ''}
          ${d.notes ? `<dt>Note</dt><dd>${esc(d.notes)}</dd>` : ''}
        </dl>
      </div>`;
    };
    const closeRow = (r) => { const b = $('.row__btn', r); if (b.getAttribute('aria-expanded') === 'true') { b.setAttribute('aria-expanded', 'false'); $('.detail', r).hidden = true; } };
    const openRow = (r) => {
      const b = $('.row__btn', r); const det = $('.detail', r);
      if (!det.dataset.ready) { det.innerHTML = detailHTML(byName[DATA.find((d) => d.id === r.dataset.id).name]); det.dataset.ready = '1'; }
      b.setAttribute('aria-expanded', 'true'); det.hidden = false;
    };
    years.addEventListener('click', (e) => {
      const more = e.target.closest('[data-more]');
      if (more) { expanded.add(+more.dataset.more); apply(); return; }
      const b = e.target.closest('.row__btn');
      if (!b) return;
      const r = b.closest('.row');
      if (b.getAttribute('aria-expanded') === 'true') closeRow(r); else openRow(r);
    });

    let t;
    tools.addEventListener('input', (e) => {
      if (e.target.name === 'q') { clearTimeout(t); t = setTimeout(() => { S.q = e.target.value.trim().toLowerCase(); apply(); }, 60); }
      else if (e.target.name === 'type') { S.type = e.target.value; apply(); }
      else if (e.target.name === 'ind') { S.ind = e.target.value; apply(); }
    });
    tools.addEventListener('submit', (e) => e.preventDefault());

    /* open a project from a link elsewhere on the page */
    const reveal = (id) => {
      const r = rowOf[id]; if (!r) return;
      const d = DATA.find((x) => x.id === id);
      if (!match(d) || r.hidden) { S.q = ''; S.type = 'all'; S.ind = ''; $('input[name="q"]', tools).value = ''; $('#t-all').checked = true; sel.value = ''; expanded.add(d.year); apply(); }
      openRow(r);
      r.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      $('.row__btn', r).focus({ preventScroll: true });
    };
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-open]');
      if (a) { e.preventDefault(); reveal(a.dataset.open); }
    });
    if (location.hash.startsWith('#p-')) setTimeout(() => reveal(location.hash.slice(3)), 0);

    apply();
  }

  /* the entrance: a prompt box types three lines and waits for Enter, Space or a click; it runs on every load, not when a section is linked */
  const ent = $('[data-entrance]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (ent && !reduce && !location.hash) {
    ent.hidden = false; document.documentElement.classList.add('is-entrance');
    const term = $('[data-entrance-term]', ent), go = $('[data-go]', ent);
    const lines = ['Hello. I’m his assistant.', 'He builds WordPress sites and keeps them running. I give the tour.', 'Press Enter, Space or click anywhere to begin.'];
    let li = 0, ci = 0, row = null, done = false, timer;
    const type = () => {
      if (li >= lines.length) return;
      if (!row) { row = document.createElement('p'); row.className = 'entrance__row is-cursor'; term.appendChild(row); }
      ci += 1; row.textContent = lines[li].slice(0, ci);
      if (ci < lines[li].length) timer = setTimeout(type, 22);
      else if (li + 1 < lines.length) { row.classList.remove('is-cursor'); row = null; li += 1; ci = 0; timer = setTimeout(type, 420); }
      else li += 1;
    };
    const finish = () => {
      if (done) return; done = true; clearTimeout(timer);
      ent.classList.add('is-out'); document.documentElement.classList.remove('is-entrance');
      setTimeout(() => { ent.hidden = true; }, 520);
      guideStart(true);
    };
    timer = setTimeout(type, 700);
    ent.addEventListener('click', finish);
    document.addEventListener('keydown', (ev) => { if (!done && (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Escape')) { ev.preventDefault(); finish(); } });
  } else guideStart(false);

  /* the menu */
  const mb = $('[data-menu-btn]'), menu = $('[data-menu]');
  if (mb && menu) {
    const set = (open) => { mb.setAttribute('aria-expanded', String(open)); menu.hidden = !open; };
    mb.addEventListener('click', () => set(menu.hidden));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { set(false); mb.focus(); } });
    document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('.top')) set(false); });
  }

  /* contact: the address exists only when the URL asks for it, assembled from parts */
  const params = new URLSearchParams(location.search);
  if (window.PF_CONTACT || params.has('showcontact') || params.has('contact')) {
    const email = ['muzu', 'itech'].join('.') + '@' + ['gmail', 'com'].join('.');
    const subject = encodeURIComponent('Live walkthrough of a project');
    $$('[data-mail]').forEach((a) => { a.textContent = email; a.href = 'mailto:' + email + '?subject=' + subject; });
    $$('[data-mail-key]').forEach((a) => { a.href = 'mailto:' + email + '?subject=' + subject; });
    $$('[data-contact="on"]').forEach((el) => { el.hidden = false; });
    $$('[data-contact="off"]').forEach((el) => { el.hidden = true; });
  }
})();
