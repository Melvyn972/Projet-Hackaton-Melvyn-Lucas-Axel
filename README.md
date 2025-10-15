# 🌐 Mini Réseau Social - Projet Hackathon

Application fullstack de réseau social avec React, Express et PostgreSQL.

## 📋 Table des matières

- [🎯 Aperçu](#-aperçu)
- [🛠️ Stack Technique](#️-stack-technique)
- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [📁 Structure du Projet](#-structure-du-projet)
- [🔧 Configuration](#-configuration)
- [💻 Développement Local](#-développement-local)
- [🌐 Déploiement Vercel](#-déploiement-vercel)
- [📍 API Routes](#-api-routes)
- [🗄️ Base de Données](#️-base-de-données)
- [🧪 Tests](#-tests)
- [🐛 Dépannage](#-dépannage)

---

## 🎯 Aperçu

Application de réseau social permettant aux utilisateurs de :
- ✅ S'inscrire et se connecter
- ✅ Créer, modifier et supprimer des posts
- ✅ Liker et commenter les posts
- ✅ Gérer leur profil utilisateur
- ✅ Ajouter des adresses
- ✅ Administration (utilisateurs ADMIN)

**Démo :**
- Backend : `https://votre-backend.vercel.app`
- Frontend : `https://votre-frontend.vercel.app`

---

## 🛠️ Stack Technique

### Backend
- **Runtime** : Node.js
- **Framework** : Express.js
- **ORM** : Prisma
- **Base de données** : PostgreSQL (Neon)
- **Authentification** : Sessions avec tokens
- **Validation** : Custom validators
- **Sécurité** : bcrypt pour le hashing

### Frontend
- **Framework** : React 18 + Vite
- **Langage** : TypeScript
- **Styling** : Tailwind CSS + shadcn/ui
- **State Management** : Zustand
- **HTTP Client** : Axios
- **Routing** : React Router v6

### Déploiement
- **Hosting** : Vercel (Frontend + Backend)
- **Database** : Neon (PostgreSQL serverless)

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ ou Bun
- Git
- Compte Neon (base de données)
- Compte Vercel (déploiement)

### Installation en 3 étapes

```bash
# 1. Cloner le projet
git clone https://github.com/votre-username/Projet-Hackaton-Melvyn-Lucas-Axel.git
cd Projet-Hackaton-Melvyn-Lucas-Axel

# 2. Configurer et lancer le backend
cd Back-end
npm install
cp .env.example .env
# Éditer .env avec votre DATABASE_URL
npx prisma generate
npx prisma db push
npm run dev

# 3. Configurer et lancer le frontend (nouveau terminal)
cd ../Front-end
npm install
cp .env.example .env
npm run dev
```

**Application disponible sur :**
- Backend : http://localhost:3001
- Frontend : http://localhost:5173

---

## 📁 Structure du Projet

```
Projet-Hackaton-Melvyn-Lucas-Axel/
│
├── Back-end/
│   ├── api/
│   │   └── index.js              # Point d'entrée Vercel
│   ├── prisma/
│   │   └── schema.prisma         # Schéma de base de données
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # Configuration Prisma
│   │   ├── controllers/          # Logique métier
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── post.controller.js
│   │   │   └── admin.controller.js
│   │   ├── services/             # Services réutilisables
│   │   │   ├── AuthService.js
│   │   │   ├── UserService.js
│   │   │   └── PostService.js
│   │   ├── middlewares/          # Middlewares Express
│   │   │   └── auth.middleware.js
│   │   ├── routes/               # Routes API
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── post.routes.js
│   │   │   └── admin.routes.js
│   │   ├── utils/                # Utilitaires
│   │   │   ├── errors.js
│   │   │   ├── hash.js
│   │   │   ├── token.js
│   │   │   └── validators.js
│   │   └── index.js              # Application Express
│   ├── .env                      # Variables d'environnement
│   ├── .env.example              # Template
│   ├── package.json
│   └── vercel.json               # Configuration Vercel
│
├── Front-end/
│   ├── src/
│   │   ├── components/           # Composants React
│   │   │   ├── ui/               # Composants shadcn/ui
│   │   │   ├── CreatePost.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/                # Pages de l'application
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Feed.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Admin.tsx
│   │   ├── store/                # State management
│   │   │   └── authStore.ts
│   │   ├── lib/                  # Utilitaires
│   │   │   ├── api.ts
│   │   │   ├── crypto.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env                      # Variables d'environnement
│   ├── .env.example              # Template
│   ├── package.json
│   └── vercel.json               # Configuration Vercel
│
├── .gitignore
├── package.json
└── README.md                     # Ce fichier
```

---

## 🔧 Configuration

### Backend (.env)

Créer `Back-end/.env` :

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Server
PORT=3001
NODE_ENV=development

# Session
SESSION_TOKEN_EXPIRY_DAYS=7

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

Créer `Front-end/.env` :

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
```

### Obtenir DATABASE_URL (Neon)

1. Aller sur [neon.tech](https://neon.tech)
2. Créer un compte et un projet
3. Copier la **Connection String** (format Prisma)
4. Coller dans `Back-end/.env`

---

## 💻 Développement Local

### Backend

```bash
cd Back-end

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Synchroniser la base de données
npx prisma db push

# Lancer en mode développement
npm run dev

# Ouvrir Prisma Studio (optionnel)
npx prisma studio
```

### Frontend

```bash
cd Front-end

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build pour production
npm run build
```

### Scripts Disponibles

**Backend :**
- `npm run dev` - Démarrer avec hot reload (bun)
- `npm run start` - Démarrer en production
- `npm run build` - Générer le client Prisma
- `npm run db:push` - Synchroniser la base de données
- `npm run db:studio` - Ouvrir Prisma Studio
- `npm run db:generate` - Générer le client Prisma

**Frontend :**
- `npm run dev` - Démarrer en développement
- `npm run build` - Build pour production
- `npm run preview` - Prévisualiser le build

---

## 🌐 Déploiement Vercel

### Déploiement Backend

1. **Aller sur** [vercel.com/new](https://vercel.com/new)
2. **Importer** votre repository GitHub
3. **Configurer** :
   - Root Directory : `Back-end`
   - Framework Preset : Other
   - Build Command : `npm run vercel-build`
4. **Variables d'environnement** :
   ```
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   SESSION_TOKEN_EXPIRY_DAYS=30
   FRONTEND_URL=https://votre-frontend.vercel.app
   PORT=3001
   ```
5. **Deploy** ✅

### Déploiement Frontend

1. **Aller sur** [vercel.com/new](https://vercel.com/new)
2. **Importer** le même repository
3. **Configurer** :
   - Root Directory : `Front-end`
   - Framework Preset : Vite
   - Build Command : `npm run build`
   - Output Directory : `dist`
4. **Variables d'environnement** :
   ```
   VITE_API_URL=https://votre-backend.vercel.app/api
   ```
5. **Deploy** ✅

### Mise à jour finale

1. Retourner dans les settings du **backend**
2. Modifier `FRONTEND_URL` avec l'URL réelle du frontend
3. **Redéployer** le backend

### Déploiement Automatique

Chaque `git push` sur `main` déclenche automatiquement un nouveau déploiement ! 🚀

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

## 🗄️ Base de Données

### Schéma Prisma

Le schéma complet est dans `Back-end/prisma/schema.prisma`

**Modèles principaux :**

- **User** - Utilisateurs de l'application
  - id, email, passwordHash, role
  - firstName, lastName, avatar, description, gender
  - Relations : addresses, sessions, posts, comments

- **Address** - Adresses des utilisateurs
  - id, street, city, postalCode, country, isPrimary
  - Relation : user

- **Session** - Sessions d'authentification
  - id, token, expiresAt
  - Relation : user

- **Post** - Publications
  - id, content, imageUrl
  - Relations : author, comments, likes

- **Comment** - Commentaires sur les posts
  - id, content
  - Relations : post, author

- **ProfileComment** - Commentaires sur les profils
  - id, content
  - Relations : targetUser, author

- **PostLike** - Likes sur les posts
  - id
  - Relations : post, user
  - Contrainte unique : (postId, userId)

### Commandes Prisma Utiles

```bash
# Générer le client
npx prisma generate

# Synchroniser la base de données
npx prisma db push

# Créer une migration
npx prisma migrate dev --name nom_migration

# Ouvrir Prisma Studio
npx prisma studio

# Réinitialiser la base de données (⚠️ supprime les données)
npx prisma db push --force-reset
```

---

## 🧪 Tests

### Tester l'API localement

**Health Check :**
```bash
curl http://localhost:3001/api/health
```

**Page d'accueil :**
```bash
curl http://localhost:3001/
```

### Tester l'API en production

```bash
curl https://votre-backend.vercel.app/api/health
```

### Tester le Frontend

1. Ouvrir http://localhost:5173
2. Créer un compte
3. Se connecter
4. Créer un post
5. Liker et commenter

---

## 🐛 Dépannage

### Erreur : "Can't reach database server"

**Solution :**
- Vérifier que `DATABASE_URL` est correcte dans `.env`
- Vérifier que la base de données Neon est accessible
- Format attendu : `postgresql://user:password@host/db?sslmode=require`

### Erreur CORS

**Solution :**
- Vérifier que `FRONTEND_URL` dans le backend correspond à l'URL du frontend
- En local : `http://localhost:5173`
- En prod : `https://votre-frontend.vercel.app`

### Erreur Prisma : "PrismaClient is unable to run"

**Solution :**
```bash
cd Back-end
npx prisma generate
```

### Frontend ne se connecte pas au Backend

**Solution :**
- Vérifier `VITE_API_URL` dans `Front-end/.env`
- En local : `http://localhost:3001/api`
- En prod : `https://votre-backend.vercel.app/api`

### Erreur 401 (Unauthorized) sur la connexion ou création de posts

**Symptôme :** L'inscription fonctionne mais pas la connexion ni la création de posts.

**Cause :** Problème de cookies entre domaines différents sur Vercel.

**Solution (déjà appliquée dans le code) :**

Les cookies sont configurés avec `sameSite: 'none'` en production pour fonctionner entre domaines.

**Pour appliquer la correction :**
```bash
git pull origin main
git add .
git commit -m "Fix: Correction cookies pour Vercel"
git push origin main
```

Vercel redéploiera automatiquement.

**Vérifications :**
1. Dans les settings du backend sur Vercel, vérifier que `FRONTEND_URL` = URL exacte du frontend (sans `/` final)
2. Vider le cache du navigateur (Ctrl + Shift + R)
3. Vérifier les cookies dans DevTools (F12 → Application → Cookies)

### Build échoue sur Vercel

**Solution :**
- Vérifier les logs Vercel
- S'assurer que toutes les variables d'environnement sont définies
- Vérifier que `vercel.json` est présent dans chaque dossier

### Erreur 404 sur les routes du frontend (après déploiement)

**Solution :**
- Vérifier que `Front-end/vercel.json` contient :
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

---

## 📚 Ressources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)

---

## 👥 Équipe

- Melvyn
- Lucas
- Axel

---

## 📄 Licence

MIT

---

**Projet Hackathon - 2025** 🚀

