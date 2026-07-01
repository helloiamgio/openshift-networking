---
title: AdminNetworkPolicy
description: Guardrail di rete a livello di cluster con AdminNetworkPolicy (ANP) e BaselineAdminNetworkPolicy (BANP).
---

Le NetworkPolicy sono per-namespace e le gestisce chi possiede il namespace: non bastano quando la **piattaforma** deve imporre regole che nessun tenant può scavalcare. Per questo esistono **AdminNetworkPolicy (ANP)** e **BaselineAdminNetworkPolicy (BANP)**, cluster-scoped, gestite dagli amministratori.

![Ordine di valutazione ANP, NetworkPolicy, BANP](/diagrams/09-networkpolicy-tiers.svg)

## Ordine di valutazione

1. **ANP** — valutate per prime, in ordine di **priorità** numerica. Azioni: **Allow**, **Deny**, **Pass**. Un `Allow`/`Deny` decide subito; `Pass` delega la decisione ai livelli sotto.
2. **NetworkPolicy** — le regole di namespace.
3. **BANP** — un'unica policy `default` cluster-wide, guardrail finale se nulla ha deciso prima.

Questo dà agli amministratori controlli che stanno **sopra** le NetworkPolicy dei tenant (ANP) e un **default di sicurezza** sotto (BANP).

## Esempio ANP

```yaml
cat <<'YAML' | oc apply -f -
apiVersion: policy.networking.k8s.io/v1alpha1
kind: AdminNetworkPolicy
metadata:
  name: platform-guardrail
spec:
  priority: 10
  subject:
    namespaces: {}
  ingress:
    - name: no-cross-tenant-monitoring
      action: Deny
      from:
        - namespaces:
            matchLabels: { tier: untrusted }
YAML
```

## Quando usarle

- **ANP**: obblighi di sicurezza cluster-wide (isolare tenant fra loro, consentire solo il monitoring dalla piattaforma).
- **BANP**: postura di default (es. deny cross-namespace) che i team possono poi allentare con le proprie NetworkPolicy.
