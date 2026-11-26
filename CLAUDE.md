# Traîneau — conventions

- Vite + TypeScript vanilla, zéro dépendance runtime. Un seul CSS : `src/style.css`.
- `src/santa.ts` : calcul du trajet (minuit local via `Intl`, interpolation grand cercle, stats). Pure, sans DOM.
- `src/cities.ts` : liste statique des villes. `src/land.ts` : contours Natural Earth 110m simplifiés (généré, ne pas éditer à la main).
- `src/main.ts` : routeur par hash (`#/`, `#/carte`, `#/lettre`, `#/reglages`), vues en template strings, localStorage (`traineau.settings`, `traineau.letter`).
- `index.html` contient le `<symbol id="sleigh">` réutilisé partout (ne pas donner cet id à un autre élément).
- Animations en CSS pur ; toujours respecter `prefers-reduced-motion`.
- Palette et polices : variables CSS dans `:root` ; Fraunces / Nunito Sans hébergées dans `src/fonts`.
- Hors ligne : `public/sw.js` (stale-while-revalidate) + pré-cache des ressources depuis `main.ts`. Changer `CACHE` dans les deux si besoin de purger.
- Tests manuels : `?demo=1`, `?at=<ISO>`. Vérifier `npx tsc` avant de committer.

Commandes : `npm run dev`, `npm run build`, `npm run preview`, `npm run icons`.
