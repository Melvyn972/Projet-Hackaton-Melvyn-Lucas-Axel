# 🌐 Mini Réseau Social - Projet Hackathon

Application fullstack de réseau social avec React, Express et PostgreSQL.

---

## 👥 Équipe

- **Melvyn THIERRY-BELLEFOND**
- **Lucas FABIOLE** 
- **Axel RATOVO PESIN**

---

## 📦 Livrables

### 🔗 Liens de déploiement
- **Frontend** : [https://projet-hackaton-melvyn-lucas-axel-f.vercel.app/]
- **Backend** : [https://projet-hackaton-melvyn-lucas-axel.vercel.app/]
- **Repository GitHub** : [https://github.com/Melvyn972/Projet-Hackaton-Melvyn-Lucas-Axel]

### 📊 Schéma de base de données

Le schéma complet est disponible dans [`schemaBD.pdf`](pdf de la base)

**Modèles principaux :**
- **User** : Utilisateurs (email, nom, prénom, avatar, description, genre, role)
- **Address** : Adresses des utilisateurs
- **Session** : Sessions d'authentification (token, expiration)
- **Post** : Publications avec contenu et image
- **Comment** : Commentaires sur les posts
- **ProfileComment** : Commentaires sur les profils
- **PostLike** : Likes sur les posts

### 📍 Documentation des routes API

Voir la section [Routes API](#-routes-api) ci-dessous.

## 🛠️ Stack Technique

- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS
- **Backend** : Node.js + Express.js
- **Base de données** : PostgreSQL (Neon Vercel)
- **ORM** : Prisma
- **Package Manager** : Bun (exclusivement)
- **Authentification** : Sessions avec tokens (sans JWT, pas de librairies)
- **Sécurité** : bcrypt pour le hashing des mots de passe
- **Déploiement** : Vercel
- **CI/CD** : GitHub Actions (déploiement automatique)
- **Versioning** : GitHub

---

## 💡 Fonctionnalités

### 🔐 Authentification
- **Inscription / Connexion** avec génération de token
- Hashage des mots de passe (bcrypt)
- Tokens stockés en **cookies** avec durée de validité
- Gestion des erreurs : email déjà utilisé, format invalide, mot de passe non conforme, session expirée

### 👤 Profil utilisateur
- Création et modification de profil : email, nom, prénom, avatar, description, genre
- Gestion des **adresses** (multiples adresses par utilisateur)
- Consultation des profils d'autres utilisateurs
- **Permissions** : seul le propriétaire peut modifier son profil

### 📝 Publications
- Créer, modifier et supprimer des posts
- **Likes** sur les posts
- **Commentaires** sous les posts
- Permissions : seul l'auteur peut modifier/supprimer son contenu

### 📊 Dashboard Admin (Role ADMIN uniquement)
- Liste de tous les utilisateurs
- **Statistiques (KPI)** :
  - Nombre total d'utilisateurs
  - Répartition par genre
  - Nombre d'adresses renseignées
  - Nombre de posts et commentaires
- Graphiques et indicateurs visuels
- Gestion des utilisateurs et posts

---

## 🚀 Installation et Démarrage

### Prérequis
- **Bun**  ou **npm**(package manager)
- Git
- Compte Neon (base de données PostgreSQL)
- Compte Vercel (déploiement)

### Installation locale

```bash
# 1. Cloner le projet
git clone https://github.com/Melvyn972/Projet-Hackaton-Melvyn-Lucas-Axel
cd Projet-Hackaton-Melvyn-Lucas-Axel

# 2. Backend
cd Back-end
bun install
# Créer .env avec DATABASE_URL
bunx prisma generate
bunx prisma db push
bun run dev

# 3. Frontend (nouveau terminal)
cd ../Front-end
bun install
# Créer .env avec VITE_API_URL
bun run dev
```

**Application disponible :**
- Backend : `http://localhost:3001`
- Frontend : `http://localhost:5173`

---

## 📁 Structure du Projet

```
Projet-Hackaton-Melvyn-Lucas-Axel/
│
├── Back-end/
│   ├── api/index.js              # Point d'entrée Vercel
│   ├── prisma/schema.prisma      # Schéma de base de données
│   ├── src/
│   │   ├── controllers/          # Logique métier
│   │   ├── services/             # Services (AuthService, UserService, PostService)
│   │   ├── routes/               # Routes API
│   │   ├── middlewares/          # auth.middleware.js
│   │   ├── utils/                # errors.js, hash.js, token.js, validators.js
│   │   └── index.js              # Application Express
│   └── package.json
│
└── Front-end/
    ├── src/
    │   ├── components/           # Composants React + shadcn/ui
    │   ├── pages/                # Login, Signup, Feed, Profile, Admin
    │   ├── store/                # authStore (Zustand)
    │   ├── lib/                  # api.ts, crypto.ts, utils.ts
    │   └── App.tsx
    └── package.json
```

---

## 🔧 Configuration

### Variables d'environnement

**Backend** (`Back-end/.env`) :
```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
PORT=3001
NODE_ENV=development
SESSION_TOKEN_EXPIRY_DAYS=7
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`Front-end/.env`) :
```env
VITE_API_URL=http://localhost:3001/api
```

> **Obtenir DATABASE_URL** : Créer un compte sur [neon.tech](https://neon.tech) et copier la connection string Prisma.

---

## 📍 API Routes

### Routes Publiques

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Page d'accueil API |
| GET | `/api/health` | Health check |
| POST | `/api/auth/signup` | Inscription |
| POST | `/api/auth/login` | Connexion |

### Routes Protégées (Authentification requise)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/users/:id` | Profil utilisateur |
| PUT | `/api/users/:id` | Modifier profil |
| DELETE | `/api/users/:id` | Supprimer compte |
| GET | `/api/posts` | Liste des posts |
| GET | `/api/posts/:id` | Détails d'un post |
| POST | `/api/posts` | Créer un post |
| PUT | `/api/posts/:id` | Modifier un post |
| DELETE | `/api/posts/:id` | Supprimer un post |
| POST | `/api/posts/:id/like` | Liker un post |
| DELETE | `/api/posts/:id/like` | Retirer un like |
| POST | `/api/posts/:id/comments` | Commenter un post |

### Routes Admin (Role ADMIN requis)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/admin/users` | Liste utilisateurs |
| DELETE | `/api/admin/users/:id` | Supprimer utilisateur |
| GET | `/api/admin/posts` | Liste posts |
| DELETE | `/api/admin/posts/:id` | Supprimer post |

### Exemples de Requêtes

**Inscription :**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Connexion :**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Créer un post :**
```bash
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionToken=YOUR_TOKEN" \
  -d '{
    "content": "Mon premier post !"
  }'
```

---

## ⚙️ Commandes Utiles

### Prisma (Base de données)
```bash
bunx prisma generate          # Générer le client Prisma
bunx prisma db push           # Synchroniser la base de données
bunx prisma studio            # Interface visuelle de la BDD
```

### Développement
```bash
bun run dev                   # Lancer en mode développement
bun run build                 # Build pour production
```


**Projet Hackathon - 2025** 🚀

