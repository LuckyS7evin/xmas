# Traîneau 🛷

Petite PWA familiale pour suivre le Père Noël le 24 décembre. 100 % statique, aucune API, aucun backend.

- Le Père Noël suit **minuit local** d'est en ouest (Kiritimati UTC+14 → île Baker UTC−12), à travers environ 200 villes.
- Avant le départ : compte à rebours au Pôle Nord. Après son passage : « Il est passé ! ».
- Réglages (prénoms, ville ; par défaut **Bésayes**), lettre au Père Noël imprimable, carte du trajet.
- **Démo** : `?demo=1` (ou le ❄ discret en bas des réglages) rejoue la tournée en ~3 min.
  Pour tester un instant précis : `?at=2026-12-24T21:00Z`.

## Développement

```sh
npm install
npm run dev      # http://localhost:5173 (accessible sur le réseau local)
npm run build    # → dist/ statique
npm run preview  # sert dist/ (le service worker n'est actif qu'en build)
npm run icons    # régénère public/icons/*.png (nécessite Playwright)
```

## Déploiement sur un LXC Debian (Caddy)

```sh
apt install caddy
# depuis le PC : npm run build && rsync -a --delete dist/ root@traineau-lxc:/srv/traineau/
```

`/etc/caddy/Caddyfile` :

```caddy
traineau.maison.lan {   # ou :80
	root * /srv/traineau
	encode zstd gzip
	file_server
	@sw path /sw.js
	header @sw Cache-Control "no-cache"
	@assets path /assets/*
	header @assets Cache-Control "public, max-age=31536000, immutable"
}
```

`systemctl reload caddy`. L'installation en PWA sur Android exige **HTTPS** (ou `localhost`) : utilise un certificat interne Caddy (`tls internal`), ton reverse proxy existant, ou GitHub Pages (les chemins sont relatifs, `dist/` fonctionne dans un sous-dossier).
