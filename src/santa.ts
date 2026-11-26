import { CITIES, POLE, type City } from './cities';

const MIN = 60_000;
export const KIDS = 2_200_000_000; // cadeaux à distribuer

/** Instant UTC où il est minuit (24→25 déc.) dans le fuseau donné. */
export function midnight(tz: string, year: number): number {
  const target = Date.UTC(year, 11, 25);
  let t = target;
  for (let i = 0; i < 2; i++) t = target - offset(tz, t);
  return t;
}
function offset(tz: string, t: number): number {
  const p: Record<string, number> = {};
  for (const x of new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(t))
    if (x.type !== 'literal') p[x.type] = +x.value;
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(t / MIN) * MIN;
}

export type Stop = City & { t: number; cum: number; km: number };
export type Trip = { year: number; home: string; stops: Stop[]; start: number; end: number; total: number };

/** Trajet de l'année. La maison (home) est une étape survolée à minuit pile. */
export function buildTrip(year: number, home: City): Trip {
  const groups = new Map<number, City[]>();
  const list = CITIES.some((c) => c.name === home.name) ? CITIES : [...CITIES, home];
  for (const c of list) {
    const m = midnight(c.tz, year);
    groups.set(m, [...(groups.get(m) ?? []), c]);
  }
  // dans chaque groupe : plus proche voisin depuis l'étape précédente, étalé sur ±14 min
  const stops: Stop[] = [];
  let last: LL = POLE;
  for (const m of [...groups.keys()].sort((a, b) => a - b)) {
    const g = groups.get(m)!, ord: City[] = [];
    while (g.length) {
      let k = 0;
      g.forEach((c, j) => { if (dist(last, c) < dist(last, g[k])) k = j; });
      ord.push((last = g.splice(k, 1)[0]));
    }
    const n = ord.length, h = ord.findIndex((c) => c.name === home.name);
    ord.forEach((c, i) => {
      const t = h < 0 ? m - 14 * MIN + (28 * MIN * (i + 0.5)) / n
        : i < h ? m - (14 * MIN * (h - i)) / h
        : i === h ? m : m + (14 * MIN * (i - h)) / (n - 1 - h);
      stops.push({ ...c, t, cum: 0, km: 0 });
    });
  }
  stops.sort((a, b) => a.t - b.t);
  const start = stops[0].t - 60 * MIN, end = stops[stops.length - 1].t + 60 * MIN;
  stops.unshift({ ...POLE, t: start, cum: 0, km: 0 });
  stops.push({ ...POLE, t: end, cum: 0, km: 0 });
  for (let i = 1; i < stops.length; i++) {
    stops[i].cum = stops[i - 1].cum + stops[i].pop;
    stops[i].km = stops[i - 1].km + dist(stops[i - 1], stops[i]);
  }
  return { year, home: home.name, stops, start, end, total: stops[stops.length - 1].cum };
}

const R = Math.PI / 180;
type LL = { lat: number; lon: number };
export function dist(a: LL, b: LL): number {
  const d = Math.sin(a.lat * R) * Math.sin(b.lat * R) + Math.cos(a.lat * R) * Math.cos(b.lat * R) * Math.cos((b.lon - a.lon) * R);
  return 6371 * Math.acos(Math.min(1, Math.max(-1, d)));
}
/** Interpolation sur le grand cercle. */
export function slerp(a: LL, b: LL, f: number): LL {
  const v = (p: LL) => [Math.cos(p.lat * R) * Math.cos(p.lon * R), Math.cos(p.lat * R) * Math.sin(p.lon * R), Math.sin(p.lat * R)];
  const A = v(a), B = v(b);
  const w = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
  if (w < 1e-6) return a;
  const s = Math.sin(w), k1 = Math.sin((1 - f) * w) / s, k2 = Math.sin(f * w) / s;
  const [x, y, z] = [0, 1, 2].map((i) => k1 * A[i] + k2 * B[i]);
  return { lat: Math.atan2(z, Math.hypot(x, y)) / R, lon: Math.atan2(y, x) / R };
}

export type Mode = 'pole' | 'vol' | 'passe' | 'rentre';
export type State = {
  mode: Mode; i: number; f: number; pos: LL; here: Stop; next: Stop;
  gifts: number; progress: number; km: number; cookies: number; milk: number;
  homeArrival: number; homeMidnight: number; countdown: number;
};

export function state(trip: Trip, now: number, home: City): State {
  const s = trip.stops;
  let i = 0;
  while (i < s.length - 2 && now >= s[i + 1].t) i++;
  const a = s[i], b = s[i + 1];
  const f = Math.min(1, Math.max(0, (now - a.t) / (b.t - a.t)));
  const delivered = now <= trip.start ? 0 : now >= trip.end ? trip.total : a.cum + b.pop * f;
  const gifts = (KIDS * delivered) / trip.total;
  const homeMidnight = midnight(home.tz, trip.year);
  const mode: Mode = now < trip.start ? 'pole' : now >= trip.end ? 'rentre' : now < homeMidnight ? 'vol' : 'passe';
  return {
    mode, i, f, pos: now <= trip.start || now >= trip.end ? POLE : slerp(a, b, f),
    here: f < 0.5 ? a : b, next: b,
    gifts, progress: Math.min(1, Math.max(0, (now - trip.start) / (trip.end - trip.start))),
    km: now <= trip.start ? 0 : a.km + (b.km - a.km) * f,
    cookies: Math.round(gifts / 2.6), milk: Math.round(gifts / 5.2),
    homeMidnight, homeArrival: homeMidnight, countdown: Math.max(0, trip.start - now),
  };
}

/** Année du prochain (ou de l'actuel) Noël : on bascule le 27 décembre. */
export const tripYear = (now: number) => {
  const d = new Date(now), y = d.getUTCFullYear();
  return now > Date.UTC(y, 11, 27) ? y + 1 : y;
};
