---
title: Route e Ingress
description: Esporre applicazioni HTTP/S con Route OpenShift e Ingress, il Router HAProxy e la terminazione TLS.
---

Per esporre un'applicazione HTTP/S all'esterno, OpenShift offre due oggetti: la **Route** (nativa OpenShift) e l'**Ingress** (standard Kubernetes). Entrambi sono serviti dall'**Ingress Controller**, un reverse-proxy basato su **HAProxy**.

## Route vs Ingress

- **Ingress**: risorsa Kubernetes standard, portabile fra distribuzioni.
- **Route**: risorsa OpenShift, più ricca (TLS granulare, wildcard, pesi per il traffico). Un Ingress viene convertito internamente in Route.

## Terminazione TLS

La Route supporta tre modalità:

| Modalità | TLS terminato | Verso il pod |
| --- | --- | --- |
| **edge** | al Router | in chiaro |
| **passthrough** | non terminato | TLS fino al pod |
| **reencrypt** | al Router, poi ri-cifrato | nuovo TLS verso il pod |

```bash
oc expose svc/web                          # crea una Route
oc create route edge web --service=web     # Route TLS edge
oc get routes -n <ns>
```

## Ingress Controller e sharding

L'`IngressController` (namespace `openshift-ingress-operator`) governa il dominio wildcard, le repliche e il **sharding**: più router che servono sottoinsiemi di Route selezionati per label/namespace, utile per separare ambienti o tenant.
