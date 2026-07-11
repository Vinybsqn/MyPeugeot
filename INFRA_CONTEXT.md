# Contexte infra & stack — vbasquin.com

Document de contexte pour démarrer un nouveau projet en réutilisant l'infra existante.

---

## Domaine

- **Registrar** : achat via Cloudflare (ou autre, géré dans Cloudflare DNS)
- **Domaine principal** : `vbasquin.com`
- **Sous-domaines actifs** :
  - `e208.vbasquin.com` → dashboard Peugeot (Cloudflare Pages)
  - `api.vbasquin.com` → API backend psa-car-controller (VPS, nginx reverse proxy)

Pour un nouveau site, il suffit d'ajouter un sous-domaine dans Cloudflare DNS :
→ **Cloudflare DNS → Add record → CNAME** pointant vers `pages.dev` ou l'IP du VPS.

---

## Hébergement frontend : Cloudflare Pages

- **Gratuit** pour les projets statiques / React / Vite
- Connecté au **repo GitHub** : chaque push sur `main` déclenche un build automatique
- **Build** : `npm run build` → output `dist/`
- **Variables d'environnement** : à configurer dans Settings → Environment variables (préfixe `VITE_` obligatoire pour Vite)
- **Cloudflare Functions** : fichiers dans `functions/` → exécutés server-side (ex: proxy API)
- **Custom domain** : Settings → Custom domains → ajouter le sous-domaine

### Variables d'env typiques pour un projet Vite sur Cloudflare Pages
```
VITE_API_URL=https://api.vbasquin.com   ← utilisé au build (côté client)
API_URL=https://api.vbasquin.com        ← utilisé par les Functions (côté serveur)
```

---

## Sécurité : Cloudflare Access (Zero Trust)

- **But** : protéger une URL pour qu'elle ne soit accessible qu'à toi
- **Gratuit** jusqu'à 50 utilisateurs
- Accès via : **Cloudflare Zero Trust → Access → Applications**
- Fonctionne par email OTP ou SSO (Google, GitHub...)
- Pour un proxy qui doit contourner l'Access côté machine : utiliser des **Service Tokens** (CF_CLIENT_ID + CF_CLIENT_SECRET) dans les headers

### Headers à passer dans un proxy Cloudflare Function
```js
'CF-Access-Client-Id': context.env.CF_CLIENT_ID,
'CF-Access-Client-Secret': context.env.CF_CLIENT_SECRET,
```

---

## Hébergement backend : VPS

- **Hébergeur** : (Hetzner ou OVH — à confirmer)
- **OS** : Linux (Ubuntu/Debian)
- **Services** :
  - `nginx` : reverse proxy HTTPS → localhost
  - `certbot` : certificats SSL Let's Encrypt
  - `systemd` : gestion des services en arrière-plan
- **Port exposé** : 443 (HTTPS via nginx), service interne sur 5000

### Schéma reverse proxy nginx
```nginx
server {
    listen 443 ssl;
    server_name api.vbasquin.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }
}
```

Pour un nouveau service backend sur le VPS, il suffit de :
1. Lancer le service sur un port libre (ex: 5001)
2. Ajouter un bloc `server` nginx avec un nouveau sous-domaine
3. Lancer `certbot --nginx -d nouveau.vbasquin.com`

---

## Stack frontend recommandée (réutiliser)

| Outil | Version | Rôle |
|-------|---------|------|
| React | 19 | UI |
| Vite | 8 | Build tool |
| Tailwind CSS | 4 | Styling |
| lucide-react | latest | Icônes |
| Cloudflare Pages | — | Hébergement |

### Créer un nouveau projet Vite + React + Tailwind
```bash
npm create vite@latest mon-projet -- --template react
cd mon-projet
npm install
npm install tailwindcss @tailwindcss/vite
```

Dans `vite.config.js` :
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Dans `src/index.css` :
```css
@import "tailwindcss";
```

---

## Déployer un nouveau site sur Cloudflare Pages

1. Créer le repo GitHub
2. Aller sur [pages.cloudflare.com](https://pages.cloudflare.com) → **Create a project**
3. Connecter le repo GitHub
4. Configurer :
   - Framework preset : Vite
   - Build command : `npm run build`
   - Output directory : `dist`
   - Root directory : `mon-projet` (si monorepo)
5. Ajouter les variables d'environnement
6. Déployer
7. Settings → Custom domains → ajouter `nouveau.vbasquin.com`
8. Dans Cloudflare DNS, le CNAME est créé automatiquement

---

## Repo GitHub

- **Compte** : [github.com/Vinybsqn](https://github.com/Vinybsqn)
- Projet e-208 : [github.com/Vinybsqn/MyPeugeot](https://github.com/Vinybsqn/MyPeugeot)
- Nouveau projet : créer un nouveau repo public ou privé sur le même compte
