---
title: 'Lab: localnet su VLAN'
description: Procedura di riferimento per collegare un pod a una VLAN fisica tramite bridge NMState e NAD localnet.
---

Procedura di riferimento per mettere un pod su una **VLAN fisica** (es. VLAN 100, subnet `192.168.100.0/24`). Richiede una VLAN reale taggata sulla NIC dei nodi.

:::caution
Questo lab tocca la rete dei nodi. Esegui prima su un nodo di test (nodeSelector) e verifica l'NNCE. Concorda la VLAN col team rete.
:::

## 1. Bridge + bridge-mapping (NMState)

```bash
cat <<'YAML' | oc apply -f -
apiVersion: nmstate.io/v1
kind: NodeNetworkConfigurationPolicy
metadata:
  name: br-vlan100
spec:
  nodeSelector: { node-role.kubernetes.io/worker: "" }
  desiredState:
    interfaces:
      - name: br-vlan100
        type: ovs-bridge
        state: up
        bridge: { port: [{ name: ens192 }] }
    ovn:
      bridge-mappings:
        - { localnet: vlan100, bridge: br-vlan100, state: present }
YAML
oc get nnce
```

## 2. NAD localnet

```bash
cat <<'YAML' | oc apply -f -
apiVersion: k8s.cni.cncf.io/v1
kind: NetworkAttachmentDefinition
metadata: { name: vlan100, namespace: net-lab }
spec:
  config: |
    {
      "cniVersion": "0.4.0",
      "name": "vlan100",
      "type": "ovn-k8s-cni-overlay",
      "topology": "localnet",
      "netAttachDefName": "net-lab/vlan100",
      "vlanID": 100,
      "subnets": "192.168.100.0/24"
    }
YAML
```

## 3. Pod sulla VLAN

```bash
cat <<'YAML' | oc apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: on-vlan
  namespace: net-lab
  annotations:
    k8s.v1.cni.cncf.io/networks: vlan100
spec:
  containers:
    - name: c
      image: registry.access.redhat.com/ubi9/ubi-minimal
      command: ["sleep","infinity"]
YAML
oc -n net-lab exec on-vlan -- ip -br addr
# atteso: net1 con IP in 192.168.100.0/24, raggiungibile sulla VLAN fisica
```

## 4. Pulizia

```bash
oc delete pod on-vlan -n net-lab
oc delete net-attach-def vlan100 -n net-lab
oc delete nncp br-vlan100
```
