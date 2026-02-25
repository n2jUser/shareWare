# ShopWave — Frontend Next.js

Interface e-commerce moderne construite avec Next.js 14, TypeScript et Tailwind CSS, connectée à ton backend FastAPI.

---

## 🚀 Installation rapide

```bash
# 1. Cloner / copier le dossier
cd shopwave

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.local.example .env.local
# Edite .env.local avec tes vraies valeurs

# 4. Lancer le dev server
npm run dev
```

L'app sera disponible sur **http://localhost:3000**

---

## ⚙️ Variables d'environnement

Crée un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

---

## 🗂️ Structure du projet

```
shopwave/
├── app/
│   ├── page.tsx                          # Homepage
│   ├── layout.tsx                        # Root layout
│   ├── globals.css                       # Système de design global
│   │
│   ├── auth/
│   │   ├── login/page.tsx               # Page de connexion
│   │   └── signup/page.tsx              # Page d'inscription (buyer/seller)
│   │
│   ├── shop/
│   │   ├── layout.tsx                   # Layout avec Navbar
│   │   ├── products/page.tsx            # Catalogue produits
│   │   ├── cart/page.tsx                # Panier d'achat
│   │   └── checkout/page.tsx            # Paiement Stripe
│   │
│   └── dashboard/
│       ├── admin/
│       │   ├── layout.tsx               # Sidebar admin (dark)
│       │   ├── page.tsx                 # Vue d'ensemble + graphiques
│       │   ├── products/page.tsx        # CRUD produits (tous)
│       │   ├── users/page.tsx           # Gestion utilisateurs
│       │   └── orders/page.tsx          # Gestion commandes + statuts
│       │
│       └── seller/
│           ├── layout.tsx               # Sidebar vendeur (light)
│           ├── page.tsx                 # Dashboard vendeur
│           └── products/page.tsx        # CRUD produits (les siens)
│
├── components/
│   └── layout/
│       ├── AuthProvider.tsx             # Auth init au chargement
│       └── Navbar.tsx                   # Navigation principale
│
├── lib/
│   ├── api.ts                           # Client Axios + tous les endpoints
│   ├── store.ts                         # Zustand auth store
│   └── utils.ts                         # formatPrice, formatDate, cn...
│
└── types/
    └── index.ts                         # Types TypeScript complets
```

---

## 🔐 Authentification

- **JWT** via cookies (`access_token` + `refresh_token`)
- **Refresh automatique** : l'interceptor Axios renouvelle le token sur 401
- **Redirection** automatique vers `/auth/login` si non connecté
- **Rôles** : `buyer`, `seller`, `admin` avec accès distincts

### Flux de connexion
```
Login → Token stocké en cookie → AuthProvider lit le token au chargement →
Zustand store → Composants accèdent à `user`
```

---

## 💳 Paiement Stripe

Le checkout suit ce flux :

1. `POST /checkout` → crée une commande + PaymentIntent Stripe
2. Le backend retourne `client_secret` + `publishable_key`
3. Le frontend charge Stripe Elements avec la clé
4. L'utilisateur saisit sa carte → `stripe.confirmCardPayment(client_secret)`
5. En cas de succès → webhook Stripe notifie le backend

### Carte de test Stripe
```
Numéro : 4242 4242 4242 4242
Expiry : 12/26
CVC    : 424
```

---

## 🎨 Système de design

### Couleurs
| Variable | Valeur | Usage |
|----------|--------|-------|
| `--ink` | `#0A0A0A` | Texte principal |
| `--accent` | `#C8FF00` | Accent vert-lime |
| `--surface` | `#FAFAF8` | Fond de page |
| `--surface-100` | `#F2F2EE` | Cartes légères |

### Typographie
- **Display** : DM Serif Display (titres)
- **Body** : DM Sans (texte courant)
- **Mono** : DM Mono (codes, prix)

### Classes utilitaires clés
```css
.btn-primary    /* Bouton noir principal */
.btn-accent     /* Bouton vert-lime */
.btn-outline    /* Bouton bordure */
.input-base     /* Champ de formulaire */
.card           /* Carte blanche avec bordure */
.badge-*        /* Badges colorés (green, red, blue, gray, accent) */
.section-label  /* Petite étiquette en majuscules */
.page-title     /* Grand titre en DM Serif */
```

---

## 📡 API — Endpoints utilisés

| Méthode | Endpoint | Usage |
|---------|----------|-------|
| POST | `/auth/signup` | Inscription |
| POST | `/auth/signin` | Connexion |
| POST | `/auth/refresh` | Refresh token |
| GET | `/auth/me` | Profil actuel |
| GET | `/products` | Liste produits (public) |
| POST | `/products` | Créer produit (seller) |
| PATCH | `/products/:id` | Modifier produit (seller) |
| DELETE | `/products/:id` | Supprimer produit (seller) |
| GET | `/products/me/products` | Mes produits (seller) |
| GET | `/cart` | Voir panier |
| POST | `/cart/items` | Ajouter au panier |
| PATCH | `/cart/items/:id` | Modifier quantité |
| DELETE | `/cart` | Vider panier |
| POST | `/checkout` | Créer commande + PaymentIntent |
| GET | `/orders` | Mes commandes |
| GET | `/admin/users` | Tous les users (admin) |
| PATCH | `/admin/users/:id/activate` | Activer user (admin) |
| PATCH | `/admin/users/:id/deactivate` | Désactiver user (admin) |
| PATCH | `/admin/orders/:id/status` | Changer statut commande (admin) |

---

## 🛠️ Dépendances principales

| Package | Usage |
|---------|-------|
| `next@14` | Framework React SSR/SSG |
| `axios` | Client HTTP + interceptors |
| `zustand` | State management (auth) |
| `js-cookie` | Gestion cookies JWT |
| `@stripe/stripe-js` | SDK Stripe frontend |
| `@stripe/react-stripe-js` | Composants React Stripe |
| `recharts` | Graphiques dashboard |
| `react-hot-toast` | Notifications toast |
| `lucide-react` | Icônes |
| `tailwindcss` | Styles utilitaires |
| `clsx` + `tailwind-merge` | Fusion de classes |

---

## 🔧 Personnalisation

### Changer l'URL de l'API
```env
NEXT_PUBLIC_API_URL=https://ton-api.com/api/v1
```

### Ajouter des catégories
Dans `app/shop/products/page.tsx`, modifier le tableau `CATEGORIES`.

### Modifier les couleurs
Dans `tailwind.config.js`, modifier les couleurs `ink`, `accent`, `surface`.

---

## 📱 Responsive

- **Mobile** : menu hamburger, grille 1 colonne, sidebar cachée
- **Tablet** : grille 2 colonnes
- **Desktop** : sidebar fixe, grille 3-4 colonnes

Les dashboards admin/seller ne sont pas encore optimisés mobile (sidebar fixe). Pour le mobile, il faudrait ajouter un drawer/overlay.