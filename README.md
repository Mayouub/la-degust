# La Dégust' du Grand Coin

Site vitrine + réservation de table + click & collect pour un ostréiculteur, avec back-office admin intégré.

## Stack

| Technologie | Usage |
|---|---|
| Next.js 15 (App Router) | Framework fullstack |
| TypeScript strict | Typage |
| Tailwind CSS v4 | Styles |
| shadcn/ui | Composants UI |
| Supabase | BDD Postgres + Auth |
| Resend | Emails transactionnels |
| Vercel | Déploiement |

## Lancer le projet en local

```bash
# 1. Installer les dépendances
npm install

# 2. Remplir les variables d'environnement
# Éditer .env.local et renseigner les clés Supabase et Resend

# 3. Démarrer le serveur de développement
npm run dev
```

L'app est accessible sur [http://localhost:3000](http://localhost:3000).

## Structure

```
src/
  app/
    (marketing)/      # Site vitrine public
    (booking)/        # Tunnel réservation + click & collect
    admin/            # Back-office (protégé)
    api/              # Route handlers Next.js
  components/
    ui/               # Composants shadcn/ui
    marketing/        # Composants landing page
    booking/          # Composants réservation/C&C
    admin/            # Composants dashboard admin
  lib/
    supabase/         # Clients Supabase (server, client, middleware)
    db/               # Schémas Zod et queries
    utils/            # Utilitaires partagés
  types/              # Types TypeScript globaux
```

## Variables d'environnement requises

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (back-office uniquement) |
| `DATABASE_URL` | URL directe Postgres (migrations) |
| `RESEND_API_KEY` | Clé API Resend |
| `RESEND_FROM_EMAIL` | Adresse expéditeur emails |
| `NEXT_PUBLIC_SITE_URL` | URL publique de l'app |

## Commandes utiles

```bash
npm run dev      # Développement (Turbopack)
npm run build    # Build production
npm run lint     # Lint ESLint
```
