---
title: 'Runbook: UDN Layer3'
description: Procedura operativa per segregare un namespace con una UDN primaria Layer3 su OpenShift 4.18, dalla scelta del CIDR alla verifica.
---

Procedura per creare un namespace segregato con una **UDN primaria Layer3** su OpenShift 4.18 (cluster IPI vSphere). Idempotente dove possibile, con verifiche a ogni passo.

## Prerequisiti

- OpenShift 4.18+ con OVN-Kubernetes (default).
- `oc` autenticato come utente con permessi su namespace e CRD `k8s.ovn.org`.

```bash
oc version | grep -i server
oc get network.config/cluster -o jsonpath='{.spec.networkType}{"\n"}'   # atteso: OVNKubernetes
```

## 1. Scegli il CIDR e verifica la non-collisione

```bash
oc get network.config/cluster -o jsonpath='{"pod:     "}{.spec.clusterNetwork[0].cidr}{"\nservice: "}{.spec.serviceNetwork[0]}{"\n"}'
oc get nodes -o jsonpath='{range .items[*]}{.status.addresses[?(@.type=="InternalIP")].address}{"\n"}{end}'
# evita anche: 100.64.0.0/16  100.88.0.0/16  169.254.0.0/17
```

CIDR scelto per l'esempio: `10.200.0.0/16` con `hostSubnet: 24`.

## 2. Crea il namespace con la label (al momento della creazione)

```bash
cat <<'EOF' | oc apply -f -
apiVersion: v1
kind: Namespace
metadata:
  name: tenant-segregato
  labels:
    k8s.ovn.org/primary-user-defined-network: ""
EOF
```

:::danger
Se il namespace esiste già senza questa label, **va ricreato**: la label non è applicabile a posteriori.
:::

## 3. Applica la UDN primaria Layer3

```bash
cat <<'EOF' | oc apply -f -
apiVersion: k8s.ovn.org/v1
kind: UserDefinedNetwork
metadata:
  name: primary-net
  namespace: tenant-segregato
spec:
  topology: Layer3
  layer3:
    role: Primary
    subnets:
      - cidr: 10.200.0.0/16
        hostSubnet: 24
EOF
```

Verifica che la UDN sia pronta:

```bash
oc -n tenant-segregato get userdefinednetwork primary-net -o jsonpath='{.status.conditions[?(@.type=="NetworkReady")].status}{"\n"}'
# atteso: True
```

## 4. Deploya un pod di prova

```bash
cat <<'EOF' | oc apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: probe
  namespace: tenant-segregato
spec:
  replicas: 2
  selector: { matchLabels: { app: probe } }
  template:
    metadata: { labels: { app: probe } }
    spec:
      containers:
        - name: probe
          image: registry.access.redhat.com/ubi9/ubi-minimal
          command: ["sleep", "infinity"]
EOF
```

## 5. Verifica l'IP sulla UDN

```bash
oc -n tenant-segregato get pods -o wide
oc -n tenant-segregato exec deploy/probe -- ip -br addr show eth0
# atteso: eth0 con IP nel range 10.200.x.0/24 (la fetta del nodo), NON 10.128.x.x
```

Se `eth0` è in `10.200.x.x`, la rete primaria del namespace è la UDN: segregazione attiva.

## Rollback

```bash
oc delete ns tenant-segregato
```

(Elimina namespace, UDN e pod in un colpo solo.)

Passo successivo: [verificare l'isolamento](/pratica/test-isolamento/) verso un altro namespace.
