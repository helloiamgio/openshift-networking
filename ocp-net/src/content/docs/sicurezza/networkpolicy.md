---
title: NetworkPolicy
description: "Micro-segmentazione est-ovest con le NetworkPolicy Kubernetes: default-deny, selettori e pattern comuni."
---

Le **NetworkPolicy** controllano il traffico **est-ovest** (fra pod) a livello L3/L4. Sono namespaced e funzionano per **selettori**: scegli quali pod regolare e da/verso chi possono comunicare.

## Il modello additivo

Punto chiave: **finché nessuna policy seleziona un pod, tutto è permesso**. Appena *una* policy lo seleziona per una direzione (Ingress o Egress), quella direzione diventa **deny by default** e passa solo ciò che le policy consentono esplicitamente. Le regole sono additive: non esiste un "deny" esplicito, si nega non permettendo.

## Default-deny

Base di ogni progetto sicuro: negare tutto l'ingress nel namespace, poi aprire il necessario.

```yaml
cat <<'YAML' | oc apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: tenant-x
spec:
  podSelector: {}
  policyTypes: [Ingress]
YAML
```

## Consentire solo una fonte

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-from-api
  namespace: tenant-x
spec:
  podSelector: { matchLabels: { app: web } }
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector: { matchLabels: { app: api } }
      ports:
        - { protocol: TCP, port: 8080 }
```

## Consentire il DNS in egress

Con un default-deny in egress, ricordati di riaprire il DNS, o le risoluzioni si rompono:

```yaml
  egress:
    - to:
        - namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: openshift-dns } }
      ports:
        - { protocol: UDP, port: 53 }
        - { protocol: TCP, port: 53 }
```

Per policy **cluster-wide** che nessun namespace può scavalcare, vedi [AdminNetworkPolicy](/sicurezza/adminnetworkpolicy/).
