# MyPeugeot Dashboard

Dashboard personnel pour voiture électrique du groupe Stellantis (Peugeot, Citroën, DS, Opel). Affiche en temps réel la batterie, les trajets, les recharges, les coûts et permet de contrôler le préchauffage et la charge programmée.

![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-PWA-purple) ![Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare_Pages-orange)

---

## Fonctionnalités

- **Tableau de bord** — niveau de batterie, autonomie, statut de charge en temps réel
- **Trajets** — historique avec carte, distance, consommation
- **Recharges** — historique des sessions avec courbe de batterie
- **Coûts** — suivi hebdomadaire et mensuel (tarifs jour/nuit configurables)
- **Stats** — historique batterie 7 jours, santé batterie, données environnement
- **Préchauffage** — activation/désactivation depuis l'app
- **Charge programmée** — planifier l'heure de début de charge
- **PWA** — installable sur iPhone/Android comme une app native
- **Thème automatique** — clair ou sombre selon le réglage système

---

## Architecture

```
Voiture ──MQTT──► VPS (psa-car-controller) ──API REST──► Dashboard (React PWA)
```

- **psa-car-controller** : tourne sur un VPS, se connecte à l'API Stellantis avec tes credentials MyPeugeot et expose une API REST locale
- **Dashboard** : React + Vite, déployé sur Cloudflare Pages, appelle l'API du VPS

---

## Prérequis

- Un VPS (Hetzner, OVH, etc. — même le plus petit suffit ~5€/mois)
- Un compte MyPeugeot / MyCitroën / MyDS / MyOpel actif
- Un compte [Cloudflare](https://cloudflare.com) (gratuit)
- Node.js 18+

---

## Installation

### Étape 1 — Installer psa-car-controller sur le VPS

Connecte-toi à ton VPS et installe psa-car-controller :

```bash
pip install psa-car-controller
```

Lance l'authentification avec ton compte MyPeugeot :

```bash
psa_car_controller -c connect
```

Il te demande ton email et mot de passe MyPeugeot, puis génère un fichier `credentials.json` avec tes tokens. **Ne partage jamais ce fichier.**

Lance le serveur :

```bash
psa_car_controller
```

Par défaut il tourne sur le port `5000`. Pour le faire tourner en permanence avec systemd :

```bash
sudo nano /etc/systemd/system/psa.service
```

```ini
[Unit]
Description=PSA Car Controller
After=network.target

[Service]
ExecStart=/usr/local/bin/psa_car_controller
WorkingDirectory=/root
Restart=always
User=root

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable psa --now
```

### Étape 2 — Exposer l'API avec HTTPS

Configure nginx avec ton domaine :

```nginx
server {
    listen 443 ssl;
    server_name api.ton-domaine.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }
}
```

Obtiens un certificat SSL :

```bash
certbot --nginx -d api.ton-domaine.com
```

> **Sécurité** : ton API sera publique. Il est fortement recommandé d'ajouter une protection [Cloudflare Access](https://www.cloudflare.com/products/zero-trust/access/) pour restreindre l'accès à toi seul.

### Étape 3 — Récupérer ton VIN

Le VIN est le numéro de série de ta voiture (17 caractères), visible sur :
- Le certificat d'immatriculation (champ E)
- Le pare-brise côté conducteur
- L'API psa-car-controller une fois lancée : `http://localhost:5000/get_vehicles`

### Étape 4 — Configurer le dashboard

Fork ce repo puis clone-le :

```bash
git clone https://github.com/TON_USERNAME/MyPeugeot.git
cd MyPeugeot/dashboard
npm install
```

Crée le fichier `.env` :

```bash
cp .env.example .env
```

Édite `.env` :

```env
VITE_API_URL=https://api.ton-domaine.com
VITE_VIN=TON_VIN_ICI
```

Lance en local pour tester :

```bash
npm run dev
```

### Étape 5 — Déployer sur Cloudflare Pages

1. Va sur [Cloudflare Pages](https://pages.cloudflare.com) et crée un nouveau projet
2. Connecte ton repo GitHub forké
3. Configure le build :
   - **Framework preset** : Vite
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Root directory** : `dashboard`
4. Dans **Settings → Environment variables**, ajoute :
   - `VITE_API_URL` → `https://api.ton-domaine.com`
   - `VITE_VIN` → `ton_vin`
5. Déploie — ton dashboard sera dispo sur `ton-projet.pages.dev`

---

## Personnaliser les tarifs électricité

Dans `src/pages/CostPage.jsx` :

```js
const RATE_DAY = 0.29    // €/kWh tarif jour (8h-23h)
const RATE_NIGHT = 0.25  // €/kWh tarif nuit (23h-8h)
const RATE_AVG = 0.27    // €/kWh tarif moyen pour le calcul de consommation roulage
```

---

## Voitures compatibles

Toute voiture du groupe Stellantis avec connectivité intégrée :

- **Peugeot** : e-208, e-2008, e-308, e-3008, e-508...
- **Citroën** : ë-C4, ë-Berlingo, ë-Spacetourer...
- **DS** : 3 E-Tense, 4 E-Tense...
- **Opel** : Mokka-e, Corsa-e...
- Les versions thermiques sont également compatibles (moins de données disponibles)

---

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React 18 + Vite |
| Style | Tailwind CSS + CSS variables |
| Cartes | Leaflet + OpenStreetMap |
| Graphiques | Recharts |
| PWA | vite-plugin-pwa |
| Déploiement | Cloudflare Pages |
| Backend | psa-car-controller (Python) |
| Infra | VPS + nginx + systemd |

---

## Crédits

- [psa-car-controller](https://github.com/flobz/psa_car_controller) par @flobz — le projet qui rend tout ça possible
- Données cartographiques : OpenStreetMap + CartoCDN
- Géocodage inversé : Nominatim
