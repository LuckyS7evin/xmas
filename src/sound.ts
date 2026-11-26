// Grelots synthétisés en Web Audio : aucun fichier son, fonctionne hors ligne.
let ctx: AudioContext | null = null;

/** À appeler depuis un geste utilisateur (exigence des navigateurs). */
export function unlock() {
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
}

/** Un tintement : partiels inharmoniques typiques d'une clochette, décroissance rapide. */
function bell(t: number, f: number, v: number, len = 0.5) {
  const c = ctx!, g = c.createGain();
  g.connect(c.destination);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  for (const [r, a] of [[1, 1], [2.76, 0.45], [5.4, 0.2]]) {
    const o = c.createOscillator(), og = c.createGain();
    o.frequency.value = f * r;
    og.gain.value = a;
    o.connect(og).connect(g);
    o.start(t);
    o.stop(t + len + 0.05);
  }
}

/** Secousse de grelots. */
export function jingle(shakes = 6, vol = 0.08) {
  if (!ctx) return;
  const t = ctx.currentTime;
  for (let i = 0; i < shakes; i++)
    for (let k = 0; k < 3; k++) bell(t + i * 0.12 + k * 0.014 + Math.random() * 0.02, 1500 + Math.random() * 1000, vol * (0.5 + Math.random() * 0.5), 0.35);
}

/** « Vive le vent » au carillon + grelots : pour son passage à la maison. */
export function carol() {
  if (!ctx) return;
  const E = 659, G = 784, C = 523, D = 587, b = 0.28, t = ctx.currentTime + 0.05;
  const tune: [number, number][] = [[E, 1], [E, 1], [E, 2], [E, 1], [E, 1], [E, 2], [E, 1], [G, 1], [C, 1.5], [D, 0.5], [E, 4]];
  let x = 0;
  for (const [f, d] of tune) { bell(t + x * b, f, 0.18, 1.2); x += d; }
  for (let i = 0; i < x; i += 1) for (let k = 0; k < 2; k++) bell(t + i * b + k * 0.015, 1700 + Math.random() * 900, 0.03, 0.25);
}
