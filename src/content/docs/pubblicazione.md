---
title: Pubblicazione (git + Cloudflare)
description: Comandi per versionare il sito su GitHub/GitLab e pubblicarlo su Cloudflare Pages, con autenticazione via token o SSH.
---

Comandi completi per portare questo sito da locale a online, dal repository fino al deploy su Cloudflare Pages.

## 1. Sviluppo locale

```bash
tar xzf openshift-networking.tar.gz && cd ocp-net
npm install
npm run dev        # http://localhost:4321
npm run build      # output statico in ./dist
```

## 2. Repository Git

### Inizializza e primo commit

```bash
git init -b main
git add .
git commit -m "OpenShift networking docs"
```

### Autenticazione GitHub

GitHub **non accetta più la password** su HTTPS: serve un token o SSH.

**Opzione A — Personal Access Token (HTTPS)**

Crea il token su GitHub → Settings → Developer settings → Personal access tokens (fine-grained, o classic con scope `repo`), poi:

```bash
git config --global credential.helper osxkeychain   # macOS: salva nel Keychain
git remote add origin https://github.com/helloiamgio/openshift-networking.git
git push -u origin main
# username: helloiamgio
# password: <incolla il TOKEN, non la password>
```

**Opzione B — SSH (consigliata)**

```bash
ls ~/.ssh/id_ed25519.pub 2>/dev/null || ssh-keygen -t ed25519 -C "giorgio" -f ~/.ssh/id_ed25519 -N ""
pbcopy < ~/.ssh/id_ed25519.pub     # copia la chiave, poi incollala su GitHub → SSH keys
git remote add origin git@github.com:helloiamgio/openshift-networking.git
ssh -T git@github.com               # verifica: "Hi helloiamgio!"
git push -u origin main
```

**Opzione C — GitHub CLI (crea repo e push in un colpo)**

```bash
gh auth login                       # GitHub.com → HTTPS → autentica via browser
gh repo create helloiamgio/openshift-networking --public --source=. --remote=origin --push
```

:::note[GitLab]
Su GitLab la logica è identica: Project Access Token / Deploy Token per HTTPS, oppure chiave SSH. Il remote diventa `git@gitlab.com:helloiamgio/openshift-networking.git`.
:::

## 3. Pubblicazione su Cloudflare Pages

### Opzione A — Git integration (consigliata, GitOps)

Dashboard Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → seleziona il repo. Preset **Astro**:

- Build command: `npm run build`
- Build output directory: `dist`

Ogni push su `main` rideploya automaticamente.

### Opzione B — CLI wrangler (Direct Upload)

```bash
npm run build
npx wrangler login
npx wrangler pages project create openshift-networking --production-branch main
npx wrangler pages deploy dist --project-name=openshift-networking
```

### Opzione C — CI/CD (già inclusa nel repo)

Le pipeline `.github/workflows/deploy.yml` e `.gitlab-ci.yml` fanno build + deploy a ogni push su `main`. Imposta i secret/variabili:

| Nome | Dove |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | token con permesso *Cloudflare Pages: Edit* |
| `CLOUDFLARE_ACCOUNT_ID` | ID account Cloudflare |

:::caution
Direct Upload e Git integration sono due modalità distinte dello stesso progetto Pages: scegline una e resta coerente, per evitare deploy sovrapposti.
:::

## 4. Dopo il deploy

Aggiorna `site:` in `astro.config.mjs` con l'URL finale del progetto Pages (es. `https://openshift-networking.pages.dev`), così sitemap e link canonici sono corretti. Poi commit + push.
