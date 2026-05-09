# LBG Command Center — Guide de déploiement

## Prérequis

- Node.js 18+
- Compte Supabase (gratuit)
- Compte Vercel (gratuit)
- Compte Meta Developers avec app WhatsApp configurée
- Clé API Anthropic

## 1. Supabase — Créer la base de données

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans SQL Editor
3. Coller et exécuter le contenu de `supabase/migrations/001_initial_schema.sql`
4. Récupérer dans Project Settings → API :
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Anthropic — Clé API Claude

1. Aller sur [platform.anthropic.com](https://platform.anthropic.com)
2. Créer une clé API → `ANTHROPIC_API_KEY`

## 3. Meta WhatsApp Cloud API — Credentials

1. Aller sur [developers.facebook.com](https://developers.facebook.com)
2. Créer une application (type : Business)
3. Ajouter le produit **WhatsApp**
4. Relier le Meta Business Portfolio
5. Ajouter le numéro WhatsApp Business existant
   > ⚠️ La migration du numéro depuis l'app WhatsApp Business vers l'API désactive l'app mobile
6. Récupérer :
   - Temporary Access Token → `META_ACCESS_TOKEN`
   - Phone Number ID → `META_PHONE_NUMBER_ID`
   - App Secret → `META_APP_SECRET`
7. Choisir un `META_VERIFY_TOKEN` (chaîne secrète de votre choix)

## 4. Déploiement Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Configurer les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ANTHROPIC_API_KEY production
vercel env add META_ACCESS_TOKEN production
vercel env add META_PHONE_NUMBER_ID production
vercel env add META_VERIFY_TOKEN production
vercel env add META_APP_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production

# Redéployer avec les variables
vercel --prod
```

## 5. Configuration du Webhook Meta

1. Dans Meta Developers → votre App → WhatsApp → Configuration
2. Webhook URL : `https://[votre-app].vercel.app/api/whatsapp/webhook`
3. Verify Token : valeur de `META_VERIFY_TOKEN`
4. Cliquer **Verify and Save**
5. S'abonner au champ : `messages`

## 6. Test end-to-end

1. Ajouter votre numéro personnel dans Meta Developers → WhatsApp → API Setup → Test Recipients
2. Depuis votre téléphone, envoyer un message au numéro LBG
3. Vérifier que la commande apparaît dans le dashboard LBG
4. Valider manuellement dans l'interface
5. Vérifier que le message de confirmation WhatsApp est reçu

## Développement local

```bash
# Copier les variables
cp .env.local.example .env.local
# Remplir les valeurs dans .env.local

# Lancer le serveur
npm run dev
# Ouvrir http://localhost:3000

# Pour tester le webhook Meta en local, utiliser ngrok :
npx ngrok http 3000
# Utiliser l'URL ngrok comme Webhook URL sur Meta Developers
```
