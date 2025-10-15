# Mini Réseau Social - Frontend

Application React moderne inspirée de Facebook avec TypeScript, Tailwind CSS et shadcn/ui.

## 🚀 Démarrage

### Installation

```bash
npm install
```

### Configuration

Créez un fichier `.env` :

```env
VITE_API_URL=http://localhost:3001/api
```

### Lancement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📦 Technologies

- **React 19** avec TypeScript
- **React Router** pour la navigation
- **Zustand** pour le state management
- **Axios** pour les appels API
- **Tailwind CSS** pour le style
- **shadcn/ui** pour les composants UI
- **Lucide React** pour les icônes
- **date-fns** pour la gestion des dates

## 🎨 Fonctionnalités

### Authentification
- ✅ Inscription
- ✅ Connexion
- ✅ Déconnexion
- ✅ Session persistante

### Feed
- ✅ Création de posts (texte + image)
- ✅ Affichage du fil d'actualité
- ✅ Système de likes
- ✅ Commentaires
- ✅ Pagination

### Profil
- ✅ Consultation du profil
- ✅ Modification du profil
- ✅ Avatar personnalisé
- ✅ Description

### Admin
- ✅ Dashboard avec KPI
- ✅ Statistiques globales
- ✅ Répartition par genre
- ✅ Moyennes et engagement

## 📁 Structure

```
src/
├── components/           # Composants réutilisables
│   ├── ui/              # Composants shadcn/ui
│   ├── PostCard.tsx     # Carte de post
│   ├── CreatePost.tsx   # Formulaire création post
│   ├── Sidebar.tsx      # Barre latérale navigation
│   └── ProtectedRoute.tsx
├── pages/               # Pages de l'application
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Feed.tsx
│   ├── Profile.tsx
│   └── Admin.tsx
├── lib/                 # Utilitaires
│   ├── api.ts          # Client API
│   └── utils.ts        # Helpers
├── store/              # State management
│   └── authStore.ts    # Store authentification
└── App.tsx             # Composant racine
```

## 🎨 Design

Interface moderne inspirée de Facebook avec :
- Design épuré et moderne
- Mode sombre/clair
- Composants réactifs
- Animations fluides
- UX optimisée

## 🔐 Authentification

L'authentification utilise des cookies HTTP-only pour la sécurité.
Les routes sont protégées via le composant `ProtectedRoute`.

## 📝 Scripts

```bash
npm run dev      # Développement
npm run build    # Build production
npm run preview  # Preview production
npm run lint     # Linter
```

## 🚀 Déploiement

L'application est prête pour le déploiement sur Vercel :

1. Pusher le code sur GitHub
2. Connecter le repo à Vercel
3. Configurer `VITE_API_URL` dans les variables d'environnement
4. Déployer !

## 📚 Documentation API

Consultez `Back-end/API_DOCUMENTATION.md` pour la documentation complète des endpoints.
