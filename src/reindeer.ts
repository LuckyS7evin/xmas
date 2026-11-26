// Les 9 rennes : anecdote fixe + humeur qui change pendant la nuit (début / milieu / fin).
export type Reindeer = { name: string; role: string; collar: string; fact: string; night: [string, string, string] };

export const REINDEER: Reindeer[] = [
  { name: 'Rodolphe', role: 'Éclaireur, en tête', collar: '#C4492A', fact: 'Son nez rouge brille si fort qu’il éclaire la route dans le brouillard.', night: ['Son nez est réglé sur « plein phare »', 'Repère les cheminées de loin', 'Le nez clignote un peu, il fatigue'] },
  { name: 'Tornade', role: 'Le plus rapide', collar: '#EBA93A', fact: 'Il a gagné la course des rennes du Pôle Nord trois ans de suite.', night: ['Trépigne d’impatience', 'File comme le vent', 'Garde le rythme, bravo !'] },
  { name: 'Danseur', role: 'Le plus gracieux', collar: '#2F7A6B', fact: 'Il atterrit sur les toits sans faire tomber un seul flocon.', night: ['Fait des pas de danse sur les nuages', 'Atterrit en douceur sur chaque toit', 'Danse encore, mais au ralenti'] },
  { name: 'Furie', role: 'Le plus fougueux', collar: '#B8406E', fact: 'Il adore les virages serrés autour des clochers.', night: ['A hâte de décoller', 'Prend les virages à toute allure', 'S’est un peu calmé…'] },
  { name: 'Fringant', role: 'Le plus élégant', collar: '#6B5BA8', fact: 'Il fait briller ses sabots avant chaque tournée.', night: ['Sabots impeccables', 'Salue les étoiles filantes', 'Une petite tache sur un sabot !'] },
  { name: 'Comète', role: 'Le plus curieux', collar: '#3A7BC4', fact: 'Il connaît le nom de toutes les étoiles du ciel.', night: ['Compte les étoiles', 'Montre la Grande Ourse au Père Noël', 'Rêve d’étoiles en volant'] },
  { name: 'Cupidon', role: 'Le plus câlin', collar: '#E2412B', fact: 'Il fait toujours un petit bisou aux sapins décorés.', night: ['Distribue des câlins', 'Envoie des bisous aux maisons', 'A besoin d’un gros câlin'] },
  { name: 'Tonnerre', role: 'Le plus fort', collar: '#7A4A1E', fact: 'Il peut tirer le traîneau tout seul quand le vent souffle fort.', night: ['Fait chauffer ses muscles', 'Tire comme quatre rennes', 'Fort, mais il a faim !'] },
  { name: 'Éclair', role: 'Le plus vif', collar: '#C9A227', fact: 'Il repère les biscuits laissés au pied des sapins en un clin d’œil.', night: ['Les oreilles aux aguets', 'A trouvé 1 000 biscuits', 'Les yeux qui se ferment…'] },
];

/** Énergie (0–100) et humeur d'un renne selon l'avancement du voyage. */
export function mood(r: Reindeer, i: number, progress: number, mode: string): { energy: number; text: string } {
  if (mode === 'pole') return { energy: 100, text: i % 2 ? 'Se repose à l’étable' : 'S’entraîne au décollage' };
  if (mode === 'rentre') return { energy: 35 + ((i * 7) % 20), text: 'Dort dans le foin, bien mérité !' };
  const energy = Math.round(100 - progress * (38 + ((i * 13) % 25)));
  return { energy, text: r.night[Math.min(2, Math.floor(progress * 3))] };
}

/** Petite tête de renne en SVG (nez rouge pour Rodolphe). */
export const reindeerSvg = (r: Reindeer) =>
  `<svg width="58" height="58" viewBox="0 0 58 58" aria-hidden="true">
  <path d="M18 18c-4-4-6-10-4-14M16 10l-6-2M30 18c4-4 6-10 4-14M32 10l6-2" stroke="#3A2630" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <ellipse cx="13" cy="22" rx="5" ry="3" fill="#A66B42" stroke="#3A2630" stroke-width="1.4" transform="rotate(-25 13 22)"/>
  <ellipse cx="35" cy="22" rx="5" ry="3" fill="#A66B42" stroke="#3A2630" stroke-width="1.4" transform="rotate(25 35 22)"/>
  <path d="M15 24c0-6 4-9 9-9s9 3 9 9v8c0 6-4 10-9 10s-9-4-9-10z" fill="#A66B42" stroke="#3A2630" stroke-width="1.6"/>
  <ellipse cx="24" cy="37" rx="6" ry="4.5" fill="#E8C3A8" stroke="#3A2630" stroke-width="1.2"/>
  <circle cx="20" cy="27" r="1.6" fill="#3A2630"/><circle cx="28" cy="27" r="1.6" fill="#3A2630"/>
  <circle cx="24" cy="34.5" r="${r.name === 'Rodolphe' ? 3.4 : 2.4}" fill="${r.name === 'Rodolphe' ? '#E2412B' : '#3A2630'}"${r.name === 'Rodolphe' ? ' class="tw"' : ''}/>
  <path d="M14 46c6 4 14 4 20 0" stroke="${r.collar}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="24" cy="50" r="3.2" fill="#EBA93A" stroke="#3A2630" stroke-width="1.2"/>
</svg>`;
