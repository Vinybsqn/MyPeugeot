# 🚗 Documentation Projet e-208 — MyPeugeot Personnel

> Application web + PWA iPhone pour surveiller ma Peugeot e-208 rouge, en remplacement de l'app officielle MyPeugeot.
>
> **Propriétaire** : Vianney Basquin (Vbasquin) — **VIN** : `VR3UHZKXZPT583300`

---

## 📋 Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture globale](#2-architecture-globale)
3. [Backend — Serveur VPS](#3-backend--serveur-vps)
   - [Informations serveur](#31-informations-serveur)
   - [psa-car-controller](#32-psa-car-controller)
   - [Service systemd](#33-service-systemd)
   - [Base de données SQLite](#34-base-de-données-sqlite)
   - [API locale Flask](#35-api-locale-flask)
4. [Endpoints API](#4-endpoints-api)
5. [Infrastructure Cloudflare](#5-infrastructure-cloudflare)
   - [Domaine et DNS](#51-domaine-et-dns)
   - [Cloudflare Tunnel](#52-cloudflare-tunnel)
   - [Cloudflare Pages](#53-cloudflare-pages)
   - [Cloudflare Access (Zero Trust)](#54-cloudflare-access-zero-trust)
6. [Frontend — Dashboard React](#6-frontend--dashboard-react)
   - [Stack technique](#61-stack-technique)
   - [Design — Liquid Glass](#62-design--liquid-glass)
   - [Pages et onglets](#63-pages-et-onglets)
   - [Composants clés](#64-composants-clés)
   - [Hooks personnalisés](#65-hooks-personnalisés)
   - [Calcul des coûts](#66-calcul-des-coûts)
7. [Widget iOS — Scriptable](#7-widget-ios--scriptable)
8. [CarPlay — Scriptable](#8-carplay--scriptable)
9. [Flux de données](#9-flux-de-données)
10. [Déploiement](#10-déploiement)
11. [Limitations connues](#11-limitations-connues)
12. [Commandes utiles](#12-commandes-utiles)

---

## 1. Vue d'ensemble

Ce projet remplace l'application officielle **MyPeugeot** par une solution entièrement personnalisée, offrant :

- Un **tableau de bord web** accessible depuis n'importe quel appareil
- Une **PWA installable sur iPhone** (Progressive Web App)
- Un **widget iOS** via Scriptable
- Une intégration **CarPlay**
- Un historique complet des **trajets**, **recharges** et **coûts**

Le tout tourne sur un VPS Hetzner peu coûteux, exposé via un tunnel Cloudflare Zero Trust, avec déploiement automatique depuis GitHub.

---

## 2. Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        VOITURE                                  │
│  Peugeot e-208 (VIN: VR3UHZKXZPT583300)                        │
│  Événements → serveurs Stellantis/Peugeot (MQTT push)          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ MQTT push + API REST Peugeot
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VPS HETZNER (ubuntu-4gb-nbg1-1)              │
│  IP: 116.203.200.254 — Ubuntu 24.04                             │
│                                                                 │
│  psa-car-controller (Python)                                    │
│  ├── Poll API Peugeot toutes les 5 min (-R 5)                  │
│  ├── Enregistre dans SQLite (-r)                                │
│  └── Expose Flask API sur localhost:5000                        │
│                                                                 │
│  cloudflared (tunnel Cloudflare)                                │
│  └── localhost:5000 → https://api.vbasquin.com                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS (tunnel Cloudflare)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE                                 │
│  api.vbasquin.com   → Tunnel vers VPS (public, sans auth)      │
│  e208.vbasquin.com  → Pages (frontend React)                   │
│                       + Access Zero Trust (OTP email)          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENTS                                    │
│  ├── Navigateur (e208.vbasquin.com)                             │
│  ├── PWA iPhone (installée depuis Safari)                       │
│  ├── Widget iOS (Scriptable)                                    │
│  └── CarPlay (Scriptable)                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Backend — Serveur VPS

### 3.1 Informations serveur

| Propriété    | Valeur                          |
|--------------|---------------------------------|
| Fournisseur  | Hetzner Cloud                   |
| Serveur      | `ubuntu-4gb-nbg1-1` (CX23)     |
| IP publique  | `116.203.200.254`               |
| OS           | Ubuntu 24.04 LTS                |
| Datacenter   | Nuremberg (nbg1)                |

### 3.2 psa-car-controller

**psa-car-controller** est un outil open source (disponible sur PyPI) qui réalise de la rétro-ingénierie de l'API officielle Peugeot/Stellantis pour exposer les données du véhicule localement.

- **Chemin d'installation** : `/opt/e208/venv/` (virtualenv Python)
- **Commande de lancement** :

```bash
/opt/e208/venv/bin/psa-car-controller -r -R 5
```

| Option | Description                                    |
|--------|------------------------------------------------|
| `-r`   | Enregistre toutes les données dans SQLite      |
| `-R 5` | Interroge l'API Peugeot toutes les **5 minutes** |

Le service reçoit également des **push MQTT** des serveurs Peugeot pour les événements en temps réel (branchement, débranchement, démarrage, préconditionnement).

### 3.3 Service systemd

Le service tourne en arrière-plan, se relance automatiquement au démarrage du serveur.

- **Fichier de service** : `/etc/systemd/system/e208.service`

Commandes de gestion :

```bash
# Voir le statut
sudo systemctl status e208

# Redémarrer le service
sudo systemctl restart e208

# Voir les logs en temps réel
sudo journalctl -u e208 -f

# Voir les 50 dernières lignes de logs
sudo journalctl -u e208 -n 50 --no-pager
```

### 3.4 Base de données SQLite

Le flag `-r` active l'enregistrement en base. La base SQLite stocke :

- **Positions GPS** (latitude, longitude, horodatage)
- **Niveaux de batterie** (%, tension, autonomie estimée)
- **Historique des trajets** (départ, arrivée, distance, consommation)
- **Sessions de recharge** (kWh chargés, durée, puissance)

> **Important** : L'historique des trajets et recharges n'est disponible qu'à partir de la date à laquelle le flag `-r` a été ajouté au service systemd.

### 3.5 API locale Flask

psa-car-controller expose un serveur **Flask** sur `http://localhost:5000`. Cette API n'est pas exposée directement sur internet — elle transite par le tunnel Cloudflare.

---

## 4. Endpoints API

Tous les endpoints sont accessibles via `https://api.vbasquin.com` (qui proxy vers `localhost:5000` sur le VPS).

Le VIN de la voiture est : `VR3UHZKXZPT583300`

### Lecture de données

| Endpoint | Description |
|----------|-------------|
| `GET /get_vehicleinfo/{VIN}` | État actuel du véhicule (batterie, position, statut charge) |
| `GET /vehicles/trips` | Historique des trajets depuis la base SQLite |
| `GET /vehicles/chargings` | Historique des recharges depuis la base SQLite |

### Contrôle de la charge

| Endpoint | Description |
|----------|-------------|
| `GET /charge_now/{VIN}/1` | Réveille la voiture + démarre la charge immédiate |
| `GET /charge_now/{VIN}/0` | Arrête la charge immédiate (retour au planning) |
| `GET /charge_hour?vin={VIN}&hour=H&minute=M` | Définit l'heure de charge programmée |

### Contrôle du véhicule

| Endpoint | Description |
|----------|-------------|
| `GET /preconditioning/{VIN}/1` | Active le préconditionnement |
| `GET /preconditioning/{VIN}/0` | Désactive le préconditionnement |
| `GET /wakeup/{VIN}` | Réveille la télématique de la voiture |

### Exemples avec curl (depuis le VPS)

```bash
# État complet de la voiture
curl http://localhost:5000/get_vehicleinfo/VR3UHZKXZPT583300

# Démarrer une charge immédiate (réveille aussi la voiture)
curl http://localhost:5000/charge_now/VR3UHZKXZPT583300/1

# Programmer la charge à 23h30
curl "http://localhost:5000/charge_hour?vin=VR3UHZKXZPT583300&hour=23&minute=30"

# Activer le préconditionnement
curl http://localhost:5000/preconditioning/VR3UHZKXZPT583300/1

# Réveiller la voiture
curl http://localhost:5000/wakeup/VR3UHZKXZPT583300
```

---

## 5. Infrastructure Cloudflare

### 5.1 Domaine et DNS

- **Domaine** : `vbasquin.com` (acheté et géré via Cloudflare)
- Sous-domaines utilisés :
  - `api.vbasquin.com` → API backend (via tunnel)
  - `e208.vbasquin.com` → Frontend React (Cloudflare Pages)

### 5.2 Cloudflare Tunnel

Un tunnel **cloudflared** tourne sur le VPS et expose le serveur Flask local vers internet de manière sécurisée, sans ouvrir de port entrant.

| Propriété    | Valeur                                        |
|--------------|-----------------------------------------------|
| Nom          | `e208`                                        |
| ID           | `20d4934b-...`                                |
| Config       | `/etc/cloudflare/config.yml` (ou similaire)  |
| Exposition   | `localhost:5000` → `https://api.vbasquin.com` |

```bash
# Vérifier le statut du tunnel
sudo systemctl status cloudflared
```

> **Sécurité** : L'API (`api.vbasquin.com`) est **publique** (sans Cloudflare Access) afin d'éviter des problèmes CORS avec le frontend. Les endpoints sensibles sont protégés au niveau de l'application.

### 5.3 Cloudflare Pages

Le frontend React est déployé via **Cloudflare Pages**.

| Propriété        | Valeur                          |
|------------------|---------------------------------|
| Projet Pages     | `mypeugeot`                     |
| URL de prod      | `e208.vbasquin.com`             |
| Repo GitHub      | `Vinybsqn/MyPeugeot`            |
| Déclencheur      | Push sur la branche `main`      |
| Répertoire build | `/dashboard/`                   |

Le déploiement est **entièrement automatique** : un `git push` sur `main` suffit à mettre à jour le frontend en production.

### 5.4 Cloudflare Access (Zero Trust)

Le frontend `e208.vbasquin.com` est protégé par **Cloudflare Access**.

| Propriété          | Valeur                                  |
|--------------------|-----------------------------------------|
| Règle              | `e208.vbasquin.com/*`                  |
| Méthode d'auth     | OTP par email (vbasquin uniquement)    |
| Durée de session   | 1 mois                                  |

À la première visite depuis un nouvel appareil, Cloudflare envoie un code à usage unique par email. Aucun mot de passe à retenir, et personne d'autre ne peut accéder à l'application.

---

## 6. Frontend — Dashboard React

### 6.1 Stack technique

| Technologie        | Usage                                      |
|--------------------|--------------------------------------------|
| React              | Framework UI                               |
| Vite               | Bundler et dev server                      |
| Tailwind CSS v4    | Styles utilitaires (`@tailwindcss/vite`)   |
| Vite PWA Plugin    | Service worker Workbox, installation iPhone |

- **Répertoire dans le repo** : `/dashboard/`
- **GitHub** : `Vinybsqn/MyPeugeot`

### 6.2 Design — Liquid Glass

Le thème visuel est "**Liquid Glass**" : un dark mode avec des effets de flou et translucidité, inspiré d'iOS.

| Élément    | Valeur                                                           |
|------------|------------------------------------------------------------------|
| Fond       | `#0c0c14` avec dégradé radial rouge                             |
| Cartes     | `backdrop-filter: blur(30px) saturate(160%)` + `rgba(255,255,255,0.06)` |
| Police     | `-apple-system, SF Pro Display`                                 |
| Accent     | Rouge Peugeot                                                    |

### 6.3 Pages et onglets

La navigation se fait via une **BottomNav** à 5 onglets (barre de navigation en bas, style iOS, effet verre).

#### Onglet 1 — 🏠 Accueil

Vue principale avec toutes les informations essentielles :

- **HeroCard** : % batterie, autonomie, badge "en charge", animation de pulsation quand la voiture charge, horodatage de synchronisation
- **StatsRow** : rangée de statistiques rapides
- **BatteryCard** : affiché uniquement quand branché — mode de charge, puissance, temps restant
- **PreconditionButton** : bouton bascule pour le préconditionnement (grisé sous 50% si non branché)
- **ChargeScheduleCard** : bascule charge immédiate/programmée, sélecteur d'heure (intervalles de 15 min), bouton "Appliquer"
- **MapCard** : carte CartoDB Voyager avec marqueur rouge de la voiture, géocodage inversé via Nominatim

#### Onglet 2 — 📊 Stats

Statistiques détaillées de la batterie et du véhicule :

- **BatteryHistoryCard** : graphique d'aire sur 7 jours (vert), construit depuis les données de recharges + trajets, ligne de référence à 20%
- Niveau de batterie, tension, autonomie, état de santé (SoH)
- Données environnementales et informations véhicule

#### Onglet 3 — 🗺️ Trajets

Historique des trajets :

- Carte avec **tous les trajets en polylines** (trajet sélectionné = rouge, autres = violet)
- Liste des trajets avec détails (date, distance, consommation)

#### Onglet 4 — ⚡ Recharges

Historique des sessions de recharge :

- Graphique de courbe de charge
- Liste des sessions de recharge (date, durée, kWh chargés, puissance)

#### Onglet 5 — 💰 Coût

Analyse financière de l'utilisation :

- Décomposition des coûts hebdomadaires et mensuels
- Coût rechargé vs coût consommé
- Comparaison semaine par semaine avec flèches haut/bas et pourcentage d'évolution

### 6.4 Composants clés

#### HeroCard

- Affiche le **pourcentage de batterie** et l'**autonomie estimée**
- Badge "En charge" avec animation de pulsation quand la voiture est branchée et charge
- Horodatage "Voiture synchronisée le..." basé sur `energy.updated_at` (et non `timed_odometer.updated_at` qui ne se met à jour que pendant la conduite)

#### BatteryCard

- Affiché **uniquement quand la voiture est branchée**
- Informations : mode de charge (AC/DC), vitesse de charge (kW), temps restant estimé

#### MapCard

- Tuiles cartographiques : **CartoDB Voyager**
- Marqueur rouge à la position actuelle de la voiture
- Géocodage inversé via **Nominatim** (OpenStreetMap) pour afficher l'adresse

#### PreconditionButton

- Bascule pour activer/désactiver le préconditionnement
- **Grisé et désactivé** si batterie < 50% ET voiture non branchée

#### ChargeScheduleCard

- Bascule entre **charge immédiate** et **charge programmée**
- Sélecteur d'heure avec intervalles de **15 minutes**
- Bouton "Appliquer" pour envoyer la programmation au véhicule

#### BatteryHistoryCard

- Graphique d'**aire 7 jours** en vert
- Données construites en fusionnant l'historique des recharges et des trajets
- Ligne de référence horizontale à **20%** (seuil d'alerte)

#### StatusBar

- Affiche l'heure de dernière mise à jour
- Spinner de chargement en cours
- Bouton de rafraîchissement manuel : envoie un wakeup à la voiture, attend 3 secondes, puis récupère les données fraîches

#### BottomNav

- Navigation en bas de l'écran, style "glass pill" (fond flouté)
- **Se cache au scroll vers le bas**, se montre au scroll vers le haut

#### ProgressBar

- Barre rouge/orange en dégradé en haut de l'écran
- Animée via l'état React pendant le chargement des données

#### Toast

- Notification "Données reçues" après un rafraîchissement réussi

### 6.5 Hooks personnalisés

#### `useVehicle`

```javascript
// Comportement :
// - Fetch GET /get_vehicleinfo/{VIN}
// - Polling automatique toutes les 60 secondes
// - refresh() : envoie wakeup → attend 3s → fetch
// - Expose `fresh` (bool) : true si données < 5 min
```

#### `useTrips`

```javascript
// Comportement :
// - Fetch GET /vehicles/trips
// - Résultats triés du plus récent au plus ancien
```

#### `useChargings`

```javascript
// Comportement :
// - Fetch GET /vehicles/chargings
// - Résultats triés du plus récent au plus ancien
```

### 6.6 Calcul des coûts

Les coûts sont calculés en distinguant **heures pleines** et **heures creuses** :

| Tarif          | Période       | Coût/kWh |
|----------------|---------------|----------|
| Heure pleine   | 8h → 23h      | 0,29 €   |
| Heure creuse   | 23h → 8h      | 0,25 €   |
| Tarif moyen    | (consommation) | 0,27 €  |

Deux méthodes de calcul :

1. **Coût rechargé** : `kWh chargés × tarif pondéré` (la session est découpée heure par heure pour appliquer le bon tarif)
2. **Coût consommé** : `(consommation_km × distance_km / 100) × 0,27 €`

La page Coût compare également les semaines entre elles avec des indicateurs visuels (flèches ↑↓ colorées et pourcentage d'évolution).

---

## 7. Widget iOS — Scriptable

Le widget iOS permet d'afficher les informations essentielles directement sur l'écran d'accueil iPhone, sans ouvrir l'app.

### Installation

1. Télécharger **Scriptable** (gratuit, App Store)
2. Copier le contenu de `e208-scriptable.js` (racine du repo) dans un nouveau script Scriptable
3. Ajouter un widget Scriptable sur l'écran d'accueil et sélectionner ce script

### Informations affichées

- Pourcentage de batterie
- Autonomie estimée (km)
- Statut de charge (en charge / non branché)
- Temps de charge restant
- Température extérieure

### Code couleur

| Couleur | Condition |
|---------|-----------|
| 🟢 Vert | En charge ET batterie > 60% |
| 🟡 Jaune | Batterie 30-60% OU avertissement |
| 🔴 Rouge | Batterie < 20% OU en charge < 30% |
| ⚪ Blanc | Situation normale |

### Comportement au tap

Un tap sur le widget ouvre directement `https://e208.vbasquin.com`.

---

## 8. CarPlay — Scriptable

Le même script Scriptable (`e208-scriptable.js`) supporte également CarPlay grâce à la détection `config.runsInWidget`.

### Affichage CarPlay

- **Pourcentage de batterie** (grand, coloré selon les mêmes règles que le widget)
- **Autonomie** en km
- **Statut de charge**

### Configuration CarPlay

1. Connecter le iPhone à la voiture
2. iOS → **Réglages → Général → CarPlay → Votre voiture → Personnaliser**
3. Ajouter **Scriptable** à la liste des apps CarPlay

### Comportement

Tapper l'icône dans CarPlay déclenche une récupération des données fraîches depuis le VPS.

---

## 9. Flux de données

```
Événement voiture
(branché, démarrage, précond.)
        │
        ▼ MQTT push
Serveurs Peugeot/Stellantis
        │
        ▼
psa-car-controller (VPS)
        │
        ├── Stocke dans SQLite
        │
        └── Cache en mémoire (Flask)

Polling toutes les 5 min (API Peugeot → Flask)
        │
        ▼
http://localhost:5000
        │
        ▼ Tunnel Cloudflare
https://api.vbasquin.com (public)
        │
        ├── Frontend React (polling 60s)
        │       └── useVehicle hook
        │
        ├── Widget iOS Scriptable
        │
        └── CarPlay Scriptable

Rafraîchissement manuel :
  1. GET /wakeup/{VIN}          ← Réveille la télématique
  2. Attente 3 secondes
  3. GET /get_vehicleinfo/{VIN} ← Données fraîches
```

---

## 10. Déploiement

### Déployer une mise à jour du frontend

```bash
# 1. Faire les modifications dans /dashboard/
# 2. Commiter et pousser sur main
git add .
git commit -m "feat: description de la modification"
git push origin main

# Cloudflare Pages détecte le push et déploie automatiquement
# Le build prend ~1-2 minutes
# URL de suivi du déploiement : Cloudflare Dashboard → Pages → mypeugeot
```

### Mettre à jour psa-car-controller sur le VPS

```bash
# Se connecter au VPS
ssh user@116.203.200.254

# Activer le virtualenv
source /opt/e208/venv/bin/activate

# Mettre à jour
pip install --upgrade psa-car-controller

# Redémarrer le service
sudo systemctl restart e208

# Vérifier
sudo systemctl status e208
```

### Repo GitHub

- **URL** : `https://github.com/Vinybsqn/MyPeugeot`
- **Branche principale** : `main`
- **Auto-deploy** : Cloudflare Pages surveille les pushs sur `main`

---

## 11. Limitations connues

### Voiture en veille pendant la charge lente AC

Pendant une charge lente (AC, borne domestique), la Peugeot e-208 **se met en veille**. La télématique ne transmet plus de données. Les données affichées dans l'app "gèlent" — c'est un comportement normal de Peugeot, non contournable.

### Horodatage de synchronisation

Le champ `timed_odometer.updated_at` de l'API Peugeot **ne se met à jour que pendant la conduite**. Pour afficher l'heure de dernière synchronisation dans HeroCard, on utilise `energy.updated_at` à la place, qui se met à jour plus fréquemment.

### Historique limité

L'historique des trajets et des recharges dans la base SQLite **n'existe qu'à partir de la date** où le flag `-r` a été ajouté à la commande systemd. Tout l'historique avant cette date est perdu.

### Rate limiting Peugeot

L'API Peugeot applique des **limites de débit**. Il faut éviter d'envoyer trop de wakeups consécutifs (notamment quand la voiture est en charge AC et en veille). Le bouton de rafraîchissement manuel doit être utilisé avec parcimonie.

---

## 12. Commandes utiles

### Gestion du service e208

```bash
# Statut du service
sudo systemctl status e208

# Redémarrer
sudo systemctl restart e208

# Arrêter
sudo systemctl stop e208

# Démarrer
sudo systemctl start e208

# Logs en temps réel
sudo journalctl -u e208 -f

# 50 dernières lignes de logs
sudo journalctl -u e208 -n 50 --no-pager

# Logs depuis hier
sudo journalctl -u e208 --since yesterday
```

### Tester l'API localement (depuis le VPS)

```bash
# État complet du véhicule
curl http://localhost:5000/get_vehicleinfo/VR3UHZKXZPT583300

# Historique des trajets
curl http://localhost:5000/vehicles/trips

# Historique des recharges
curl http://localhost:5000/vehicles/chargings

# Démarrer une charge immédiate (réveille aussi la voiture)
curl http://localhost:5000/charge_now/VR3UHZKXZPT583300/1

# Arrêter la charge immédiate
curl http://localhost:5000/charge_now/VR3UHZKXZPT583300/0

# Programmer la charge à 23h00
curl "http://localhost:5000/charge_hour?vin=VR3UHZKXZPT583300&hour=23&minute=0"

# Activer le préconditionnement
curl http://localhost:5000/preconditioning/VR3UHZKXZPT583300/1

# Réveiller la voiture
curl http://localhost:5000/wakeup/VR3UHZKXZPT583300
```

### Gestion du tunnel Cloudflare

```bash
# Statut du tunnel
sudo systemctl status cloudflared

# Redémarrer le tunnel
sudo systemctl restart cloudflared

# Logs du tunnel
sudo journalctl -u cloudflared -n 50 --no-pager
```

### Accès à la base SQLite

```bash
# Ouvrir la base de données
sqlite3 /opt/e208/venv/lib/python*/site-packages/psa_car_controller/db/*.db

# (ajuster le chemin selon la version Python installée)
# Lister les tables
.tables

# Voir les dernières positions
SELECT * FROM positions ORDER BY Timestamp DESC LIMIT 10;

# Quitter sqlite3
.quit
```

---

*Documentation rédigée le 22 mai 2026 — Projet Peugeot e-208 personnel de Vianney Basquin*
