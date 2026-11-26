# Traîneau 🛷

Une petite application web pour suivre le Père Noël pendant sa tournée du 24 décembre, pensée pour les enfants et le téléphone familial. Elle s'installe sur Android (PWA), fonctionne hors ligne et reste 100 % statique : pas de backend, pas d'API, pas de traceur.

**Démo :** https://luckys7evin.github.io/xmas/ — ajoutez `?demo=1` pour rejouer toute la tournée en 3 minutes.

## Fonctionnalités

- **Suivi en direct.** Le Père Noël suit minuit local d'est en ouest, de Kiritimati (UTC+14) à l'île Baker (UTC−12), en passant par environ 200 villes. Il survole la ville choisie dans les réglages (Paris par défaut) à **minuit pile**.
- **Écran principal.** Ville survolée, globe animé, compteur de cadeaux qui défile, avancement du voyage et heure d'arrivée chez vous. Avant le 24 : compte à rebours au Pôle Nord.
- **Cadeaux pour notre ville**, distribués dans le quart d'heure avant minuit.
- **Carte.** Globe à faire tourner au doigt, zoom par pincement, villes cliquables avec leur heure de passage.
- **Les 9 rennes.** Une fiche par renne, avec son énergie qui baisse au fil de la nuit.
- **Lettre au Père Noël.** Gardée sur le téléphone, imprimable, et « envoyée au Pôle Nord » avec une enveloppe animée.
- **Un mot du Père Noël** pour chaque enfant, dévoilé le 25 au réveil.
- **Grelots** synthétisés en Web Audio, et « Vive le vent » à minuit (coupés par défaut).
- **Veilleuse** plein écran pour la chambre, qui garde l'écran allumé.
- **Thème nuit** automatique de 18 h à 7 h.
- **Accessibilité.** Les animations sont réduites si le téléphone le demande (`prefers-reduced-motion`).

Les réglages (prénoms, ville, thème) et la lettre restent dans le `localStorage` du navigateur : rien ne quitte le téléphone.

## Développement

Vite + TypeScript, sans framework ni dépendance à l'exécution.

```sh
npm install
npm run dev      # http://localhost:5173 (accessible sur le réseau local)
npm run build    # → dist/ statique
npm run preview  # sert dist/ (le service worker n'est actif qu'en build)
npm run icons    # régénère public/icons/*.png (nécessite Playwright)
```

Paramètres de test : `?demo=1` (temps accéléré) et `?at=2026-12-24T21:00Z` (instant précis).

## Déploiement

**GitHub Pages.** Le workflow `.github/workflows/pages.yml` publie l'app à chaque push sur `main`. À activer une seule fois dans *Settings → Pages → Source : GitHub Actions*.

**Serveur statique (Caddy, nginx…).** Copiez `dist/` sur le serveur. Les chemins sont relatifs, l'app fonctionne aussi dans un sous-dossier. Exemple avec Caddy :

```caddy
traineau.example.lan {
	root * /srv/traineau
	encode zstd gzip
	file_server
	@sw path /sw.js
	header @sw Cache-Control "no-cache"
	@assets path /assets/*
	header @assets Cache-Control "public, max-age=31536000, immutable"
}
```

L'installation en PWA exige **HTTPS** (ou `localhost`).

## Licence et crédits

- Code sous licence [MIT](LICENSE).

- Polices [Fraunces](https://github.com/undercasetype/Fraunces) et [Nunito Sans](https://github.com/Fonthausen/NunitoSans), sous licence SIL Open Font License 1.1 (voir `src/fonts/OFL-*.txt`).
- Contours des continents : [Natural Earth](https://www.naturalearthdata.com/), domaine public.
