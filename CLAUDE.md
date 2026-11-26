# Traîneau — conventions

- Vite + TypeScript vanilla, zéro dépendance runtime. Un seul CSS : `src/style.css`.
- `src/santa.ts` : calcul du trajet (minuit local via `Intl`, interpolation grand cercle, stats). Pure, sans DOM.
- `src/cities.ts` : liste statique des villes. `src/land.ts` : contours Natural Earth 110m simplifiés (généré, ne pas éditer à la main).
- `src/sound.ts` : grelots synthétisés en Web Audio (pas de fichiers). `src/reindeer.ts` : données et SVG des rennes.
- `src/main.ts` : routeur par hash (`#/`, `#/carte`, `#/rennes`, `#/lettre`, `#/reglages`), vues en template strings, localStorage (`traineau.settings`, `traineau.letter`).
- `index.html` contient le `<symbol id="sleigh">` réutilisé partout (ne pas donner cet id à un autre élément).
- Animations en CSS pur ; toujours respecter `prefers-reduced-motion`.
- Palette et polices : variables CSS dans `:root`, redéfinies pour `:root[data-theme=nuit]` (jamais de couleur en dur pour un fond/texte/ombre de carte) ; Fraunces / Nunito Sans hébergées dans `src/fonts`.
- Hors ligne : `public/sw.js` (stale-while-revalidate) + pré-cache des ressources depuis `main.ts`. Changer `CACHE` dans les deux si besoin de purger.
- Tests manuels : `?demo=1`, `?at=<ISO>`. Vérifier `npx tsc` avant de committer.

Commandes : `npm run dev`, `npm run build`, `npm run preview`, `npm run icons`.
