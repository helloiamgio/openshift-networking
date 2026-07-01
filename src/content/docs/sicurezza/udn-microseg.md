---
title: UDN + NetworkPolicy (micro-segmentazione)
description: Combinare l'isolamento di rete delle UDN con le NetworkPolicy per una micro-segmentazione a due livelli.
---

UDN e NetworkPolicy risolvono problemi diversi e si combinano bene: la **UDN** dà il confine **fra tenant** (segmento isolato di default), le **NetworkPolicy** danno la micro-segmentazione **dentro** il tenant.

## Due livelli di isolamento

1. **Confine di tenant (UDN)**: una [UDN primaria](/udn/introduzione/) mette i pod del namespace in un segmento OVN isolato. Il traffico verso altri segmenti non è raggiungibile per costruzione, senza bisogno di policy.
2. **Micro-segmentazione (NetworkPolicy)**: dentro la UDN, i pod si vedono fra loro. Per limitare chi parla con chi (es. solo `api` → `db` sulla 5432) si usano le NetworkPolicy come al solito.

Le NetworkPolicy applicate a un namespace con UDN primaria agiscono **sulla rete della UDN**: stessi selettori, stessa semantica additiva, ma dentro il segmento isolato.

## Pattern completo

```yaml
cat <<'YAML' | oc apply -f -
# default-deny dentro la UDN
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny, namespace: tenant-segregato }
spec:
  podSelector: {}
  policyTypes: [Ingress, Egress]
---
# solo api -> db:5432
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: api-to-db, namespace: tenant-segregato }
spec:
  podSelector: { matchLabels: { app: db } }
  policyTypes: [Ingress]
  ingress:
    - from: [{ podSelector: { matchLabels: { app: api } } }]
      ports: [{ protocol: TCP, port: 5432 }]
YAML
```

## In sintesi

- **UDN** → separazione forte fra tenant, self-service, di default.
- **NetworkPolicy** → regole fini dentro il tenant.
- **[ANP/BANP](/sicurezza/adminnetworkpolicy/)** → guardrail di piattaforma sopra tutto.

Tre livelli che, insieme, coprono dall'isolamento macro alla regola sulla singola porta.
