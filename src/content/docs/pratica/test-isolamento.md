---
title: Test di isolamento
description: Verificare praticamente che una UDN primaria isoli i pod da un altro namespace sul default, e il ruolo della NetworkPolicy.
---

Per toccare con mano la segregazione: due namespace, uno su UDN e uno sul default, e si prova che non si raggiungano.

## Setup

Dal [runbook](/pratica/runbook-udn/) hai già `tenant-segregato` su UDN `10.200.0.0/16`. Crea un secondo namespace **normale** (sul default):

```bash
oc new-project tenant-normale 2>/dev/null || oc project tenant-normale
cat <<'EOF' | oc apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: target
  namespace: tenant-normale
spec:
  replicas: 1
  selector: { matchLabels: { app: target } }
  template:
    metadata: { labels: { app: target } }
    spec:
      containers:
        - name: target
          image: registry.access.redhat.com/ubi9/ubi-minimal
          command: ["sleep", "infinity"]
EOF
```

## Prova di raggiungibilità

```bash
# IP del target (sul default, 10.128.x.x)
TARGET_IP=$(oc -n tenant-normale get pod -l app=target -o jsonpath='{.items[0].status.podIP}')
echo "target: $TARGET_IP"

# dal pod segregato, prova a raggiungerlo
oc -n tenant-segregato exec deploy/probe -- bash -c "timeout 4 bash -c '</dev/tcp/$TARGET_IP/22' 2>&1 || echo 'NON raggiungibile (atteso)'"
```

Con la UDN primaria, il pod in `tenant-segregato` vive in un VRF separato: **non ha rotta** verso la pod network di default, quindi il target non è raggiungibile. È l'isolamento "by design".

## E il traffico esterno?

La UDN primaria mantiene comunque l'accesso nord-sud (uscita verso l'esterno) e supporta Service ClusterIP, EgressIP e route. L'isolamento è verso gli **altri segmenti interni**, non un blocco totale.

```bash
oc -n tenant-segregato exec deploy/probe -- bash -c "getent hosts kubernetes.default.svc || echo 'DNS ok via UDN'"
```

## NetworkPolicy: micro-segmentazione

L'isolamento UDN è a livello di segmento. Per regole fini **dentro** la UDN (es. consentire solo certe porte fra pod), si usano comunque le NetworkPolicy:

```yaml
cat <<'EOF' | oc apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: tenant-segregato
spec:
  podSelector: {}
  policyTypes: [Ingress]
EOF
```

UDN per la separazione tenant, NetworkPolicy per la micro-segmentazione: le due cose si combinano.

## Pulizia

```bash
oc delete ns tenant-segregato tenant-normale
```
