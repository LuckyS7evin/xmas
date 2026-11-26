import './style.css';
import { CITIES, HOME_DEFAULT, type City } from './cities';
import { buildTrip, state, tripYear, slerp as slerpLL, KIDS, type Trip, type State } from './santa';
import { LAND } from './land';
import { REINDEER, mood, reindeerSvg } from './reindeer';
import { unlock, jingle, carol } from './sound';

/* ---------- temps (réel ou démo) ---------- */
const q = new URLSearchParams(location.search);
const demo = q.has('demo');
const t0 = Date.now();
const shift = q.has('at') ? Date.parse(q.get('at')!) - t0 || 0 : 0; // ?at=2026-12-24T20:00Z (tests)
let trip: Trip = buildTrip(tripYear(t0 + shift), HOME_DEFAULT);
const SPEED = 600; // ~27 h de tournée en 2 min 40
function now(): number {
  if (!demo) {
    const n = Date.now() + shift;
    if (tripYear(n) !== trip.year) trip = buildTrip(tripYear(n), home());
    return n;
  }
  const span = trip.end - trip.start + 70 * 60_000;
  return trip.start - 10 * 60_000 + (((Date.now() - t0) * SPEED) % span);
}

/* ---------- stockage ---------- */
const load = <T>(k: string, d: T): T => { try { return { ...d, ...JSON.parse(localStorage.getItem(k) || '{}') }; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* mode privé */ } };
const settings = load('traineau.settings', { names: '', city: HOME_DEFAULT.name, sound: false, theme: 'auto' });
const letter = load('traineau.letter', { text: '', wishes: '', sig: '', sent: 0 });
const home = (): City => CITIES.find((c) => c.name === settings.city) ?? HOME_DEFAULT;

/* ---------- formats ---------- */
const nf = new Intl.NumberFormat('fr-FR');
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const hm = (t: number, tz: string) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(t).map((x) => [x.type, x.value]));
  return `${+p.hour} h ${p.minute}`;
};
const de = (n: string) =>
  n === 'Pôle Nord' ? 'du Pôle Nord' : /^Le /.test(n) ? 'du ' + n.slice(3) : /^La /.test(n) ? 'de la ' + n.slice(3) : /^[AEIOUYÉÈÎÔH]/i.test(n) ? "d'" + n : 'de ' + n;
const big = (n: number) => (n >= 1e9 ? nf.format(+(n / 1e9).toFixed(1)) + ' Md' : n >= 1e6 ? nf.format(Math.round(n / 1e6)) + ' M' : nf.format(Math.round(n)));
const pad = (n: number) => String(n).padStart(2, '0');
function countdown(ms: number) {
  const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d} j ${h} h ${pad(m)}` : `${h} h ${pad(m)} min ${pad(s % 60)} s`;
}
const kidNames = () => settings.names.split(/\s*(?:&|,|\bet\b)\s*/).map((x) => x.trim()).filter(Boolean);
const houseOf = () => (settings.names.trim() ? `La maison de ${esc(settings.names.trim())}` : `La maison à ${esc(home().name)}`);

/* ---------- icônes ---------- */
const ICON = {
  pen: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 20l4-1L19 8l-3-3L5 16zM14 7l3 3"/></svg>',
  map: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/></svg>',
  back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  gear: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
  bell: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4M12 3v2"/><path class="mute" d="M3 3l18 18"/></svg>',
  moon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l18-8-6 18-3-8z"/><path d="M12 13l9-10"/></svg>',
  print: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/></svg>',
};
const sleighSvg = (w = 110, h = 44) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 110 44" aria-hidden="true"><path class="trail" d="M-40 30C-24 26-10 30 2 28" stroke="#EBA93A" stroke-width="2.5" fill="none" stroke-linecap="round"/><use href="#sleigh"/></svg>`;
const bar = (title: string) => `<header class="bar up"><a class="round sm" href="#/" aria-label="Retour">${ICON.back}</a><h2>${title}</h2></header>`;

/* ---------- écran principal ---------- */
const LANDS = '<path d="M80 110c25-18 60-10 70 10s-10 35 10 50 20 40-10 45-40-20-55-35-40-50-15-70z"/><path d="M210 90c30-8 60 5 70 25s-15 30 5 45-5 45-35 35-30-30-45-45-25-52 5-60z"/><path d="M150 230c20 0 35 12 28 28s-35 18-40 0 0-28 12-28z"/>';
function homeView() {
  return `<main class="screen" id="home">
  <button class="gear sound${settings.sound ? ' on' : ''}" id="snd" type="button" aria-label="Grelots" aria-pressed="${settings.sound}">${ICON.bell}</button>
  <a class="gear" href="#/reglages" aria-label="Réglages">${ICON.gear}</a>
  <header class="hero up"><div class="kicker" id="kicker"></div><h1 id="title"></h1></header>
  <div class="stage" id="stage"><div class="stage-in">
    <svg width="390" height="300" viewBox="0 0 390 300" aria-hidden="true">
      <defs><clipPath id="g"><circle cx="195" cy="160" r="120"/></clipPath></defs>
      <circle class="halo" cx="195" cy="160" r="134"/>
      <circle cx="195" cy="160" r="120" fill="#2F3F7A"/>
      <g clip-path="url(#g)">
        <g class="land" fill="#FFF4E6">${LANDS}<g transform="translate(360 0)">${LANDS}</g></g>
        <g fill="#EBA93A"><circle class="tw" cx="140" cy="150" r="3"/><circle class="tw" cx="230" cy="130" r="2.5" style="animation-delay:.8s"/><circle class="tw" cx="200" cy="200" r="2.5" style="animation-delay:1.6s"/><circle class="tw" cx="262" cy="176" r="2" style="animation-delay:2.1s"/><circle class="tw" cx="110" cy="190" r="2" style="animation-delay:1.1s"/></g>
      </g>
      <circle cx="195" cy="160" r="120" fill="none" stroke="#3A2630" stroke-width="2"/>
      <path d="M318 30a22 22 0 1 0 22 28a17 17 0 1 1 -22 -28z" fill="#EBA93A" stroke="#3A2630" stroke-width="1.5"/>
      <g fill="#EBA93A" stroke="#3A2630" stroke-width="1"><path class="tw" d="M50 40l3 7 7 1-7 3-3 7-3-7-7-3 7-1z"/><path class="tw" style="animation-delay:1.2s" d="M60 230l2 5 5 1-5 2-2 5-2-5-5-2 5-1z"/><path class="tw" style="animation-delay:.5s" d="M348 250l2 5 5 1-5 2-2 5-2-5-5-2 5-1z"/><path class="tw" style="animation-delay:1.9s" d="M100 18l2 4 4 1-4 2-2 4-2-4-4-2 4-1z"/></g>
    </svg>
    <div class="sl" id="sl" title="Fais sonner les grelots !"><div class="bob">${sleighSvg()}</div></div>
  </div></div>
  <section class="stats up d2">
    <div><b id="gifts" class="long"></b><span id="giftsL"></span></div><i></i>
    <a class="stat-link" href="#/rennes"><b>9</b><span>rennes en forme ›</span></a><i></i>
    <div><b id="pct"></b><span id="pctL"></span></div>
  </section>
  <section class="card house up d4" id="house">
    <svg width="60" height="64" viewBox="0 0 60 64" aria-hidden="true">
      <circle class="smoke" cx="42" cy="14" r="4" fill="#E8C3A8"/><circle class="smoke" cx="44" cy="12" r="3" fill="#E8C3A8" style="animation-delay:.8s"/><circle class="smoke" cx="41" cy="13" r="3.5" fill="#E8C3A8" style="animation-delay:1.6s"/>
      <rect x="38" y="18" width="8" height="14" fill="#C4492A" stroke="#3A2630" stroke-width="1.5"/>
      <path d="M6 34L30 14l24 20" fill="#3A2630" stroke="#3A2630" stroke-width="2" stroke-linejoin="round"/>
      <rect x="11" y="33" width="38" height="27" rx="2" fill="#EBA93A" stroke="#3A2630" stroke-width="1.8"/>
      <rect x="25" y="44" width="10" height="16" fill="#3A2630"/>
      <rect class="win" x="15" y="39" width="7" height="7" fill="#FFF1C9" stroke="#3A2630" stroke-width="1"/>
    </svg>
    <div><div class="muted">${houseOf()}</div><div class="big" id="arrive"></div><div class="hush" id="hush"></div></div>
  </section>
  <div class="city-gifts up d4" id="cg"></div>
  <section class="card note" id="note" hidden></section>
  <nav class="actions up d6">
    <a class="btn" href="#/lettre"><span class="wig">${ICON.pen}</span>Écrire au Père Noël</a>
    <a class="round" href="#/carte" aria-label="Voir la carte">${ICON.map}</a>
    <a class="round" href="#/veilleuse" aria-label="Veilleuse">${ICON.moon}</a>
  </nav></main>`;
}

let lastMode = '', lastHere = '', lastJingle = 0;
const shown: Record<string, string> = {};
function tickHome() {
  const s = state(trip, now(), home()), $ = (id: string) => document.getElementById(id)!;
  if (settings.sound) {
    if (lastMode === 'vol' && s.mode === 'passe') carol();
    else if (lastHere && s.here.name !== lastHere && (s.mode === 'vol' || s.mode === 'passe') && Date.now() - lastJingle > 4000) {
      jingle(s.here.pop >= 5 ? 8 : 4); lastJingle = Date.now();
    }
  }
  lastHere = s.here.name;
  if (s.mode !== lastMode) {
    lastMode = s.mode;
    $('sl').classList.toggle('rest', s.mode === 'pole' || s.mode === 'rentre');
    $('house').classList.toggle('passe', s.mode === 'passe' || s.mode === 'rentre');
  }
  const set = (id: string, html: string) => { if (shown[id] !== html) $(id).innerHTML = shown[id] = html; };
  const morning = s.mode !== 'pole' && now() >= s.homeMidnight + MORNING;
  $('note').hidden = !morning;
  if (morning) set('note', santaNote());
  const cg = cityGifts(now());
  set('cg', `🎁 <b>${nf.format(cg.done || cg.total)}</b> ${cg.done === cg.total ? 'cadeaux déposés' : cg.done ? `/ ${nf.format(cg.total)} cadeaux déposés` : 'cadeaux à livrer'} ${de(home().name).replace(/^de /, 'à ').replace(/^d'/, 'à ').replace(/^du /, 'au ')}${cg.kids ? ` · dont <b>${cg.kids}</b> ${cg.kids > 1 ? 'pour nos lutins' : 'pour notre lutin'}` : ''}`);
  if (s.mode === 'pole') {
    set('kicker', 'Au Pôle Nord, on se prépare…');
    set('title', 'Le Père Noël attend<br><em>au Pôle Nord</em>');
    set('gifts', big(KIDS)); set('giftsL', 'cadeaux emballés');
    set('pct', 'J-' + Math.ceil(s.countdown / 86_400_000)); set('pctL', 'avant le départ');
    set('arrive', `Départ dans <em>${countdown(s.countdown)}</em>`);
    set('hush', 'Les lutins emballent les cadeaux…');
  } else if (s.mode === 'rentre') {
    set('kicker', 'Joyeux Noël !');
    set('title', 'Il est bien rentré<br><em>au Pôle Nord</em>');
    set('gifts', big(KIDS)); set('giftsL', 'cadeaux déposés');
    set('pct', '100 %'); set('pctL', 'du voyage');
    set('arrive', 'Il est <em>passé !</em>'); set('hush', 'Joyeux Noël à toute la famille !');
  } else {
    set('kicker', s.mode === 'vol' ? 'Il était une fois, le 24 décembre…' : 'Cette nuit, chez vous…');
    const w = `au-dessus ${de(s.here.name)}`;
    set('title', `Le Père Noël vole<br><em style="white-space:nowrap;font-size:${Math.min(34, Math.floor(640 / w.length))}px">${w}</em>`);
    set('gifts', nf.format(Math.floor(s.gifts))); set('giftsL', 'cadeaux déposés');
    set('pct', Math.floor(s.progress * 100) + ' %'); set('pctL', 'du voyage');
    if (s.mode === 'vol') {
      set('arrive', 'Il arrive à <em>minuit pile</em>');
      set('hush', s.homeArrival - now() < 3_600_000 ? 'Vite, au lit ! Il approche…' : 'Chut… il faut dormir !');
    } else {
      set('arrive', 'Il est <em>passé !</em>'); set('hush', now() < s.homeMidnight + MORNING ? 'Un petit mot t’attendra au réveil…' : 'Les cadeaux sont sous le sapin…');
    }
  }
}

/* ---------- carte (globe orthographique) ---------- */
const RAD = Math.PI / 180, GR = 150;
/** Vue de la carte : suit le traîneau tant qu'on n'a pas touché au globe. */
const view = { lat: 0, lon: 0, k: 1, follow: true };
let gr = GR, picked = -1; // rayon courant (zoom), étape sélectionnée
type P = [number, number, number]; // x, y, profondeur (>0 = face visible)
function proj(lat: number, lon: number, c: { lat: number; lon: number }): P {
  const l = (lon - c.lon) * RAD, p = lat * RAD, p0 = c.lat * RAD;
  return [gr * Math.cos(p) * Math.sin(l), -gr * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)),
    Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l)];
}
const project = (lat: number, lon: number, c: { lat: number; lon: number }): [number, number, boolean] => {
  const [x, y, d] = proj(lat, lon, c);
  return [x, y, d > 0];
};
/** Polygone découpé à l'horizon : les parties cachées suivent le bord du globe. */
function ringPath(pts: P[]): string {
  const n = pts.length, s0 = pts.findIndex((p) => p[2] > 0);
  if (s0 < 0) return '';
  const out: [number, number][] = [];
  let exit = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[(s0 + i) % n], b = pts[(s0 + i + 1) % n];
    if (a[2] > 0) out.push([a[0], a[1]]);
    if (a[2] > 0 !== b[2] > 0) {
      const t = a[2] / (a[2] - b[2]), x = a[0] + t * (b[0] - a[0]), y = a[1] + t * (b[1] - a[1]);
      const ang = Math.atan2(y, x);
      if (a[2] > 0) exit = ang;
      else {
        let d = ang - exit;
        d -= Math.round(d / (2 * Math.PI)) * 2 * Math.PI;
        for (let k = 1; k < 12; k++) out.push([gr * Math.cos(exit + (d * k) / 12), gr * Math.sin(exit + (d * k) / 12)]);
      }
      out.push([gr * Math.cos(ang), gr * Math.sin(ang)]);
    }
  }
  return 'M' + out.map(([x, y]) => f1(x) + ' ' + f1(y)).join('L') + 'Z';
}
const f1 = (n: number) => n.toFixed(1);
function globeSvg(s: State) {
  if (view.follow) Object.assign(view, { lat: Math.max(-30, Math.min(50, s.pos.lat)) * 0.8, lon: s.pos.lon });
  const c = view;
  gr = GR * view.k;
  let land = '';
  for (const r of LAND) {
    const pts: P[] = [];
    for (let i = 0; i < r.length; i += 2) pts.push(proj(r[i + 1], r[i], c));
    land += `<path d="${ringPath(pts)}"/>`;
  }
  let past = '', future = '';
  const st = trip.stops;
  for (let i = 0; i < st.length - 1; i++) {
    let prev: [number, number, boolean] | null = null;
    for (let k = 0; k <= 6; k++) {
      const a = st[i], b = st[i + 1], f = k / 6;
      const done = i < s.i || (i === s.i && f <= s.f);
      const v = slerpLL(a, b, f), p = project(v.lat, v.lon, c);
      if (prev && prev[2] && p[2]) { const seg = `M${f1(prev[0])} ${f1(prev[1])}L${f1(p[0])} ${f1(p[1])}`; if (done) past += seg; else future += seg; }
      prev = p;
    }
  }
  let dots = '';
  st.forEach((x, i) => {
    if (x.name === 'Pôle Nord') return;
    const [px, py, v] = project(x.lat, x.lon, c);
    if (v) dots += i <= s.i ? `<circle cx="${f1(px)}" cy="${f1(py)}" r="2.6" fill="#EBA93A"/>` : `<circle cx="${f1(px)}" cy="${f1(py)}" r="2" fill="#FFF4E6" stroke="#3A2630" stroke-width=".8"/>`;
  });
  const h = home(), [hx, hy, hv] = project(h.lat, h.lon, c);
  const [sx, sy, sv] = project(s.pos.lat, s.pos.lon, c);
  const pk = trip.stops[picked], [kx, ky, kv] = pk ? project(pk.lat, pk.lon, c) : [0, 0, false];
  return `<defs><clipPath id="gc"><circle r="${gr}"/></clipPath></defs><circle class="halo" r="${gr + 12}"/><circle r="${gr}" fill="#2F3F7A"/>
  <g clip-path="url(#gc)"><g fill="#FFF4E6" stroke="#3A2630" stroke-width=".6" stroke-linejoin="round">${land}</g>
  <path d="${future}" stroke="#FFF4E6" stroke-width="1.2" stroke-dasharray="2 4" fill="none" opacity=".55"/>
  <path d="${past}" stroke="#EBA93A" stroke-width="2.4" fill="none" stroke-linecap="round"/>${dots}
  ${hv ? `<g transform="translate(${f1(hx)} ${f1(hy)})"><path d="M-6 0L0-6 6 0V6H-6Z" fill="#C4492A" stroke="#3A2630" stroke-width="1.4" stroke-linejoin="round"/></g>` : ''}
  ${kv ? `<circle cx="${f1(kx)}" cy="${f1(ky)}" r="7" fill="none" stroke="#F2825C" stroke-width="2.5"/>` : ''}
  ${sv ? `<circle class="tw" cx="${f1(sx)}" cy="${f1(sy)}" r="11" fill="#EBA93A" opacity=".45"/><use href="#sleigh" x="${f1(sx - 30)}" y="${f1(sy - 18)}" width="60" height="24"/>` : ''}</g>
  <circle r="${gr}" fill="none" stroke="#3A2630" stroke-width="2"/>`;
}

function mapView() {
  return `<main class="screen">${bar('Le grand <em>voyage</em>')}
  <section class="card globe up d2"><svg id="map" viewBox="-165 -165 330 330" role="img" aria-label="Globe avec le trajet du Père Noël"><g id="mapg"></g></svg>
    <div class="map-ui"><button class="round sm" id="zin" type="button" aria-label="Zoomer">+</button><button class="round sm" id="zout" type="button" aria-label="Dézoomer">−</button><button class="pill" id="follow" type="button" hidden>Suivre le traîneau</button></div>
    <p class="hint map-hint">Fais tourner le globe avec le doigt, pince pour zoomer, touche une ville.</p>
    <div id="mcity"></div></section>
  <div class="legend up d2" style="margin-top:14px"><span><i style="background:#EBA93A"></i>visitée</span><span><i style="background:#FFF4E6"></i>à venir</span><span><i style="background:#C4492A;border-radius:2px"></i>chez nous</span></div>
  <section class="card grid up d4" id="mstats"></section>
  <section class="card up d6" style="margin-bottom:28px"><div class="big">Dernières <em>étapes</em></div><ul class="stops" id="mstops"></ul></section></main>`;
}
function renderGlobe() {
  const s = state(trip, now(), home()), st = trip.stops[picked];
  document.getElementById('mapg')!.innerHTML = globeSvg(s);
  document.getElementById('follow')!.hidden = view.follow;
  const box = document.getElementById('mcity')!;
  if (!st) { box.innerHTML = ''; return s; }
  const h = home(), done = picked <= s.i;
  box.innerHTML = `<div class="city-pop"><button class="x" id="unpick" type="button" aria-label="Fermer">×</button>
    <div class="big">${esc(st.name)} <small>${esc(st.country)}</small></div>
    <p>${done ? 'Le Père Noël est passé' : 'Le Père Noël passera'} à <b>${hm(st.t, st.tz)}</b>, heure locale${hm(st.t, st.tz) !== hm(st.t, h.tz) ? ` — <b>${hm(st.t, h.tz)}</b> chez nous` : ''}.</p>
    <p class="muted">${done ? '✓ Cadeaux déposés' : `⏳ Encore ${countdown(Math.max(0, st.t - now())).replace(/ \d+ s$/, '')}`}</p></div>`;
  return s;
}
function tickMap() {
  const s = renderGlobe(), tz = home().tz;
  const visited = trip.stops.slice(1, s.i + 1).filter((x) => x.name !== 'Pôle Nord');
  document.getElementById('mstats')!.innerHTML =
    `<div><b>${nf.format(Math.round(s.km))}</b><span>km parcourus</span></div><div><b>${visited.length}/${trip.stops.length - 2}</b><span>villes visitées</span></div>` +
    `<div><b>${big(s.cookies)}</b><span>biscuits mangés</span></div><div><b>${big(s.milk)}</b><span>verres de lait</span></div>`;
  const last = visited.slice(-8).reverse();
  document.getElementById('mstops')!.innerHTML = last.length
    ? last.map((x) => `<li><span>${esc(x.name)} <small>· ${esc(x.country)}</small></span><small>${hm(x.t, tz)}</small></li>`).join('')
    : `<li><span>Le traîneau attend au Pôle Nord.</span></li>`;
}
function bindMap() {
  const svg = document.getElementById('map') as unknown as SVGSVGElement;
  const pts = new Map<number, { x: number; y: number }>();
  let moved = 0, pinch = 0, frame = 0;
  const redraw = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; renderGlobe(); }); };
  const zoom = (f: number) => { view.k = Math.min(6, Math.max(1, view.k * f)); redraw(); };
  const toSvg = (e: PointerEvent) => { const r = svg.getBoundingClientRect(), u = 330 / r.width; return [(e.clientX - r.left) * u - 165, (e.clientY - r.top) * u - 165]; };
  const spread = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  svg.addEventListener('pointerdown', (e) => {
    svg.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = 0;
    if (pts.size === 2) pinch = spread();
  });
  svg.addEventListener('pointermove', (e) => {
    const p = pts.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    if (pts.size === 2) { const d = spread(); if (pinch) zoom(d / pinch); pinch = d; return; }
    if (moved < 4) return;
    const u = (330 / svg.getBoundingClientRect().width) / (gr * RAD); // degrés par pixel écran
    view.follow = false;
    view.lon -= dx * u;
    view.lat = Math.max(-80, Math.min(80, view.lat + dy * u));
    redraw();
  });
  const up = (e: PointerEvent) => {
    if (pts.size === 1 && moved < 6) {
      // tap : étape visible la plus proche (≤ 16 unités)
      const [x, y] = toSvg(e);
      let best = -1, bd = 16;
      trip.stops.forEach((c, i) => {
        if (c.name === 'Pôle Nord') return;
        const [px, py, v] = project(c.lat, c.lon, view);
        const d = Math.hypot(px - x, py - y);
        if (v && d < bd) { bd = d; best = i; }
      });
      picked = best;
      redraw();
    }
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = 0;
  };
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', (e) => pts.delete(e.pointerId));
  svg.addEventListener('wheel', (e) => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });
  document.getElementById('zin')!.onclick = () => zoom(1.5);
  document.getElementById('zout')!.onclick = () => zoom(1 / 1.5);
  document.getElementById('follow')!.onclick = () => { view.follow = true; redraw(); };
  document.getElementById('mcity')!.onclick = (e) => { if ((e.target as Element).id === 'unpick') { picked = -1; redraw(); } };
}

/* ---------- mot du Père Noël (au réveil, le 25) ---------- */
const MORNING = 7 * 3_600_000; // dévoilé à 7 h
const NOTE_A = [
  'merci pour les biscuits, ils étaient délicieux ! Rodolphe a adoré sa carotte.',
  'j’ai vu que tu avais été très sage cette année. Bravo, continue comme ça !',
  'ta maison était l’une des plus jolies de toute ma tournée.',
  'Tornade et Comète t’envoient un gros câlin de renne !',
  'j’ai fait très attention à ne pas te réveiller, tu dormais si bien.',
];
const NOTE_B = [
  'Prends bien soin de tes cadeaux et partage-les avec le sourire.',
  'Les lutins te disent bonjour depuis le Pôle Nord.',
  'Je repasserai l’année prochaine, promis !',
  'N’oublie pas de faire un gros câlin à ta famille aujourd’hui.',
];
const hash = (x: string) => [...x].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
function santaNote() {
  const names = kidNames(), y = trip.year;
  const signer = Math.max(0, names.findIndex((n) => n.toLowerCase() === letter.sig.trim().toLowerCase()));
  const lines = (names.length ? names : ['Les enfants']).map((n, i) => {
    const k = hash(n + y);
    const a = letter.sent && i === signer ? 'j’ai bien reçu ta lettre au Pôle Nord, merci de tout cœur !' : NOTE_A[k % NOTE_A.length];
    return `<p><b>${esc(n)}</b>, ${a} ${NOTE_B[(k >>> 3) % NOTE_B.length]}</p>`;
  }).join('');
  return `<div class="note-head"><span>✉</span>Un mot du <em>Père Noël</em></div>${lines}<div class="note-sig">— Père Noël</div>`;
}

/* ---------- compteur de notre ville ---------- */
const WORLD = 8_100_000_000;
/** Cadeaux pour la ville choisie : distribués pendant le quart d'heure avant minuit. */
function cityGifts(t: number) {
  const h = home(), total = Math.max(1, Math.round((h.pop * 1e6 * KIDS) / WORLD));
  const m = state(trip, t, h).homeMidnight, f = Math.min(1, Math.max(0, (t - (m - 15 * 60_000)) / (15 * 60_000)));
  const kids = kidNames().length;
  return { total, done: Math.floor(total * f), kids };
}

/* ---------- veilleuse ---------- */
let wake: { release(): Promise<void> } | null = null;
function nightView() {
  return `<main class="veil" id="veil">
  <button class="veil-x" id="vx" type="button" aria-label="Quitter la veilleuse">×</button>
  <svg class="veil-sky" viewBox="0 0 390 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path class="veil-moon" d="M250 140a52 52 0 1 0 52 66a40 40 0 1 1 -52 -66z" fill="#EBA93A" opacity=".85"/>
    <g fill="#FFF4E6">${[[40, 80], [110, 40], [170, 120], [330, 60], [360, 300], [60, 260], [140, 330], [300, 400], [40, 470], [210, 250], [350, 520], [90, 590], [250, 560]]
      .map(([x, y], i) => `<circle class="tw" cx="${x}" cy="${y}" r="${1.2 + (i % 3) * 0.6}" style="animation-delay:${(i * 0.7) % 4}s;animation-duration:${3 + (i % 4)}s"/>`).join('')}</g>
    <path d="M0 640c80-30 150-30 210-10s120 20 180-5V700H0z" fill="#151a3d"/>
    <g transform="translate(60 600)"><path d="M0 30L22 12l22 18" fill="#0E1230"/><rect x="5" y="29" width="34" height="22" fill="#0E1230"/><rect class="win" x="10" y="35" width="7" height="7"/></g>
  </svg>
  <div class="veil-sl"><svg width="110" height="44" viewBox="0 0 110 44" aria-hidden="true"><use href="#sleigh"/></svg></div>
  <p class="veil-txt" id="vt"></p></main>`;
}
function tickNight() {
  const s = state(trip, now(), home());
  const txt = s.mode === 'pole' ? 'Le Père Noël se repose au Pôle Nord.' : s.mode === 'rentre' ? 'Joyeux Noël. Fais de beaux rêves.'
    : s.mode === 'passe' ? 'Il est passé… Dors bien.' : `Il vole au-dessus ${de(s.here.name)}.<br>Dors vite, il arrive à minuit.`;
  const e = document.getElementById('vt');
  if (e && e.innerHTML !== txt) e.innerHTML = txt;
}
async function bindNight() {
  document.getElementById('vx')!.onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); location.hash = '#/'; };
  try { await document.documentElement.requestFullscreen?.(); } catch { /* refusé : on reste en page */ }
  try { wake = await (navigator as any).wakeLock?.request('screen'); } catch { /* non supporté */ }
}

/* ---------- les 9 rennes ---------- */
function reindeerView() {
  return `<main class="screen">${bar('Les 9 <em>rennes</em>')}
  <p class="hint up" style="margin:10px 20px 0">Touche un renne pour entendre ses grelots.</p>
  ${REINDEER.map((r, i) => `<section class="card deer up" style="animation-delay:${0.05 * i}s" data-i="${i}">
    ${reindeerSvg(r)}<div><div class="big">${r.name} <small>${r.role}</small></div>
    <p>${r.fact}</p><div class="meter"><i id="en${i}"></i></div><div class="hush" id="mo${i}"></div></div></section>`).join('')}
  <div style="height:28px"></div></main>`;
}
function tickReindeer() {
  const s = state(trip, now(), home());
  REINDEER.forEach((r, i) => {
    const m = mood(r, i, s.progress, s.mode);
    (document.getElementById('en' + i) as HTMLElement).style.width = m.energy + '%';
    document.getElementById('mo' + i)!.textContent = `${m.energy} % · ${m.text}`;
  });
}

/* ---------- lettre ---------- */
function letterView() {
  return `<main class="screen">${bar('Ma lettre au <em>Père Noël</em>')}
  <form class="card letter up d2" id="lf">
    <label class="field"><span>Cher Père Noël,</span><textarea name="text" rows="5" placeholder="Cette année, j'ai été très sage…">${esc(letter.text)}</textarea></label>
    <label class="field"><span>Ma liste de souhaits</span><textarea name="wishes" rows="5" placeholder="Un vélo rouge&#10;Un livre de dragons">${esc(letter.wishes)}</textarea></label>
    <label class="field"><span>Signé</span><input name="sig" value="${esc(letter.sig)}" placeholder="${esc(settings.names) || 'Ton prénom'}"></label>
    <p class="hint">Ta lettre est gardée sur ce téléphone.</p>
  </form>
  <p class="hint sent-hint" id="sent">${letter.sent ? '✓ Ta lettre est bien arrivée au Pôle Nord.' : ''}</p>
  <nav class="actions up d4"><button class="btn" id="send" type="button">${ICON.send}Envoyer au Pôle Nord</button><button class="round" id="print" type="button" aria-label="Imprimer ma lettre">${ICON.print}</button></nav>
  <article class="printout" id="po"></article></main>`;
}
function renderPrintout() {
  const w = letter.wishes.split('\n').map((x) => x.trim()).filter(Boolean);
  document.getElementById('po')!.innerHTML = `<header><h1>Cher <em>Père Noël</em>,</h1>${sleighSvg(150, 60)}</header>
  <p>${esc(letter.text) || '&nbsp;'}</p>${w.length ? `<h3>Ma liste de souhaits</h3><ul>${w.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
  <div class="sig">${esc(letter.sig) || '&nbsp;'}</div>`;
}
function bindLetter() {
  const f = document.getElementById('lf') as HTMLFormElement;
  f.addEventListener('input', () => {
    const d = new FormData(f);
    Object.assign(letter, { text: d.get('text'), wishes: d.get('wishes'), sig: d.get('sig') });
    save('traineau.letter', letter);
    renderPrintout();
  });
  document.getElementById('print')!.onclick = () => window.print();
  document.getElementById('send')!.onclick = sendLetter;
  renderPrintout();
}

function sendLetter() {
  letter.sent = Date.now();
  save('traineau.letter', letter);
  if (settings.sound) { unlock(); jingle(8); }
  const o = document.createElement('div');
  o.className = 'fly-letter';
  o.innerHTML = `<div class="env">
    <svg class="paper" viewBox="0 0 120 90" aria-hidden="true"><rect x="8" y="4" width="104" height="82" rx="4" fill="#FFF7EE" stroke="#3A2630" stroke-width="2.5"/><path d="M22 24h76M22 38h76M22 52h56" stroke="#E8C3A8" stroke-width="4" stroke-linecap="round"/></svg>
    <svg class="body" viewBox="0 0 160 110" aria-hidden="true"><rect x="3" y="3" width="154" height="104" rx="8" fill="#EBA93A" stroke="#3A2630" stroke-width="3"/><path d="M3 107l62-48h30l62 48" fill="none" stroke="#3A2630" stroke-width="3" stroke-linejoin="round"/><circle cx="80" cy="66" r="11" fill="#C4492A" stroke="#3A2630" stroke-width="2.5" class="seal"/></svg>
    <svg class="flap" viewBox="0 0 160 70" aria-hidden="true"><path d="M3 3h154L80 66z" fill="#F2BE5C" stroke="#3A2630" stroke-width="3" stroke-linejoin="round"/></svg>
  </div>
  <div class="spark" aria-hidden="true">${'<i></i>'.repeat(10)}</div>
  <p class="fly-msg" role="status">Ta lettre s’envole vers le <em>Pôle Nord</em> !<small>Touche l’écran pour revenir</small></p>`;
  document.body.append(o);
  const close = () => { o.remove(); const h = document.getElementById('sent'); if (h) h.textContent = '✓ Ta lettre est bien arrivée au Pôle Nord.'; };
  o.onclick = close;
  setTimeout(close, 6500);
}

/* ---------- réglages ---------- */
function settingsView() {
  const opts = [HOME_DEFAULT, ...[...CITIES].filter((c) => c.pop > 0).sort((a, b) => a.name.localeCompare(b.name, 'fr'))]
    .map((c) => `<option value="${esc(c.name)}"${c.name === settings.city ? ' selected' : ''}>${esc(c.name)} · ${esc(c.country)}</option>`).join('');
  return `<main class="screen">${bar('Réglages')}
  <form class="card up d2" id="sf">
    <label class="field"><span>Prénoms des enfants</span><input name="names" value="${esc(settings.names)}" placeholder="Léa &amp; Tom" autocomplete="off"></label>
    <label class="field"><span>Notre ville</span><select name="city">${opts}</select></label>
    <p class="hint">Le Père Noël passe chez vous à minuit pile, heure locale.</p>
    <label class="field" style="margin-top:18px"><span>Thème</span><select name="theme">${[['auto', 'Automatique (nuit de 18 h à 7 h)'], ['jour', 'Toujours jour'], ['nuit', 'Toujours nuit']]
      .map(([v, l]) => `<option value="${v}"${settings.theme === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
  </form>
  <div class="foot"><button class="ghost${demo ? ' demo-on' : ''}" id="demo" type="button" aria-label="Mode démo">❄</button></div></main>`;
}
function bindSettings() {
  const f = document.getElementById('sf') as HTMLFormElement;
  f.addEventListener('input', () => {
    const d = new FormData(f);
    Object.assign(settings, { names: String(d.get('names')), city: String(d.get('city')), theme: String(d.get('theme')) });
    applyTheme();
    save('traineau.settings', settings);
  });
  document.getElementById('demo')!.onclick = () => {
    const u = new URL(location.href);
    demo ? u.searchParams.delete('demo') : u.searchParams.set('demo', '1');
    u.hash = '#/';
    location.href = u.toString();
  };
}

/* ---------- thème jour / nuit ---------- */
function applyTheme() {
  const h = +new Intl.DateTimeFormat('en-GB', { timeZone: home().tz, hour: 'numeric', hourCycle: 'h23' }).format(now());
  const night = settings.theme === 'nuit' || (settings.theme === 'auto' && (h >= 18 || h < 7));
  const v = night ? 'nuit' : 'jour';
  if (document.documentElement.dataset.theme !== v) {
    document.documentElement.dataset.theme = v;
    document.querySelector('meta[name=theme-color]')!.setAttribute('content', night ? '#1C2348' : '#FBE6D2');
  }
}
applyTheme();
setInterval(applyTheme, demo ? 500 : 30_000);

/* ---------- son ---------- */
if (settings.sound) addEventListener('pointerdown', unlock, { once: true });
document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('#snd')) {
    settings.sound = !settings.sound; save('traineau.settings', settings);
    const b = t.closest('#snd')!; b.classList.toggle('on', settings.sound); b.setAttribute('aria-pressed', String(settings.sound));
    if (settings.sound) { unlock(); jingle(); }
  } else if (t.closest('#sl, .deer')) { unlock(); jingle(5); }
});

/* ---------- routeur ---------- */
const app = document.getElementById('app')!;
let timer = 0, raf = 0;
function scaleStage() {
  const st = document.getElementById('stage');
  if (st) st.style.setProperty('--s', String(st.clientWidth / 390));
}
function route() {
  if (trip.home !== home().name) trip = buildTrip(trip.year, home());
  wake?.release().catch(() => {}); wake = null;
  document.documentElement.classList.toggle('veil-on', location.hash === '#/veilleuse');
  clearInterval(timer); cancelAnimationFrame(raf); lastMode = ''; lastHere = ''; for (const k in shown) delete shown[k];
  const r = location.hash.replace('#/', '');
  scrollTo(0, 0);
  if (r === 'carte') { app.innerHTML = mapView(); Object.assign(view, { k: 1, follow: true }); picked = -1; tickMap(); bindMap(); timer = setInterval(tickMap, demo ? 250 : 2000); }
  else if (r === 'rennes') { app.innerHTML = reindeerView(); tickReindeer(); timer = setInterval(tickReindeer, demo ? 300 : 5000); }
  else if (r === 'veilleuse') { app.innerHTML = nightView(); tickNight(); bindNight(); timer = setInterval(tickNight, 5000); }
  else if (r === 'lettre') { app.innerHTML = letterView(); bindLetter(); }
  else if (r === 'reglages') { app.innerHTML = settingsView(); bindSettings(); }
  else {
    app.innerHTML = homeView(); scaleStage();
    const loop = () => { tickHome(); raf = requestAnimationFrame(loop); };
    loop();
  }
}
addEventListener('hashchange', route);
addEventListener('resize', scaleStage);
if (demo) document.body.insertAdjacentHTML('beforeend', '<div class="demo-badge">démo</div>');
route();

/* ---------- PWA : hors ligne ---------- */
const CACHE = 'traineau-v1';
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('sw.js');
  addEventListener('load', () => {
    const urls = performance.getEntriesByType('resource').map((e) => e.name).filter((u) => u.startsWith(location.origin));
    caches.open(CACHE).then((c) => c.addAll([...new Set([location.pathname, ...urls])])).catch(() => {});
  });
}
