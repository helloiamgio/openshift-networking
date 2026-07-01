# OpenShift Networking

Sito di documentazione (Astro + Starlight) sul networking di **OpenShift 4.18**: modello OVN-Kubernetes, pod network, pianificazione CIDR, **Multus** e **User-Defined Networks (UDN)**. Pensato per deploy su **Cloudflare Pages** con flusso **GitOps**.

## Sviluppo locale

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # output statico in ./dist
npm run preview    # anteprima della build
```

Requisiti: Node.js 20+.

## Struttura

```
src/content/docs/
├── index.mdx                 # landing (splash)
├── fondamenti/               # modello a piani, pod network, CIDR
├── multus/                   # reti secondarie (NAD, plugin)
├── udn/                      # reti primarie (topologie, UDN/CUDN)
├── confronto.md              # Multus vs UDN
└── pratica/                  # runbook + test isolamento
public/diagrams/              # diagrammi SVG (dark-mode integrata)
```

Navigazione e metadati: `astro.config.mjs`.

## Deploy su Cloudflare Pages

### Opzione A — Git integration (consigliata, GitOps)

1. Push del repo su GitHub/GitLab (`helloiamgio/openshift-networking`).
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Seleziona il repo. Preset framework: **Astro**.
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Ogni push su `main` rideploya in automatico.

### Opzione B — CI/CD con wrangler

Pipeline incluse:

- **GitHub Actions**: `.github/workflows/deploy.yml`
- **GitLab CI**: `.gitlab-ci.yml`

Secrets/variabili richiesti:

| Nome | Dove |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | token con permesso *Cloudflare Pages: Edit* |
| `CLOUDFLARE_ACCOUNT_ID` | ID account Cloudflare |

### Opzione C — Deploy manuale (Direct Upload)

```bash
npm run build
npx wrangler pages deploy dist --project-name=openshift-networking
```

> Nota: Direct Upload e Git integration sono due modalità distinte dello stesso progetto Pages. Scegline una e resta coerente, per evitare deploy sovrapposti.

## Personalizzazione

- Dominio/URL: `site` in `astro.config.mjs`.
- Sidebar e titoli: blocco `starlight({ sidebar: [...] })`.
- Link "Edit page": `editLink.baseUrl` in `astro.config.mjs`.

---

Contenuti tecnici riferiti a OpenShift Container Platform 4.18 (OVN-Kubernetes, Kubernetes 1.31).
