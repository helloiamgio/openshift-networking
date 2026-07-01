---
title: 'Lab: NetworkPolicy default-deny'
description: Laboratorio pratico per applicare un default-deny e riaprire selettivamente il traffico in un namespace.
---

Laboratorio per toccare con mano la micro-segmentazione: parti da un namespace aperto, applichi un default-deny, verifichi il blocco, poi riapri solo ciò che serve.

## 1. Setup

```bash
oc new-project np-lab 2>/dev/null || oc project np-lab
oc run web  --image=registry.access.redhat.com/ubi9/ubi-minimal --labels=app=web -- sleep infinity
oc run api  --image=registry.access.redhat.com/ubi9/ubi-minimal --labels=app=api -- sleep infinity
oc expose pod web --port=8080 2>/dev/null || true
```

## 2. Prima: tutto aperto

```bash
WEB_IP=$(oc get pod web -o jsonpath='{.status.podIP}')
oc exec api -- bash -c "timeout 3 bash -c '</dev/tcp/$WEB_IP/8080' && echo OK-aperto || echo bloccato"
# atteso: OK-aperto
```

## 3. Applica default-deny ingress

```bash
cat <<'YAML' | oc apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-ingress, namespace: np-lab }
spec:
  podSelector: {}
  policyTypes: [Ingress]
YAML
oc exec api -- bash -c "timeout 3 bash -c '</dev/tcp/$WEB_IP/8080' && echo OK || echo bloccato"
# atteso: bloccato
```

## 4. Riapri solo api -> web

```bash
cat <<'YAML' | oc apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: web-from-api, namespace: np-lab }
spec:
  podSelector: { matchLabels: { app: web } }
  policyTypes: [Ingress]
  ingress:
    - from: [{ podSelector: { matchLabels: { app: api } } }]
      ports: [{ protocol: TCP, port: 8080 }]
YAML
oc exec api -- bash -c "timeout 3 bash -c '</dev/tcp/$WEB_IP/8080' && echo OK-riaperto || echo bloccato"
# atteso: OK-riaperto
```

## 5. Pulizia

```bash
oc delete project np-lab
```
