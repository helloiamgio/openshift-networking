---
title: 'localnet: pod/VM su VLAN fisica'
description: Collegare pod e VM direttamente a una VLAN fisica esistente con la topologia localnet di OVN-Kubernetes.
---

Quando un pod o una VM deve stare **direttamente su una rete fisica** esistente (una VLAN di storage, backup, o una LAN legacy) con un IP di quella subnet, si usa la topologia **localnet**. A differenza di pod-net e UDN, localnet **non è un overlay**: salta l'incapsulamento e collega il workload al bridge fisico del nodo.

![Percorso localnet: dal pod/VM alla VLAN fisica passando per il bridge](/diagrams/08-localnet.svg)

## Come funziona

localnet è una rete **secondaria** OVN-Kubernetes che aggancia un logical switch a un **bridge fisico** del nodo tramite una **bridge mapping**. Il traffico esce su quel bridge, sulla NIC, e finisce sulla VLAN indicata — come una macchina qualsiasi in quel segmento.

Due passi:

1. Configurare la **bridge mapping** sui nodi (via NMState, vedi [Bridge con NMState](/fisiche/bridge-nmstate/)): associa un nome di rete fisica a un bridge OVS.
2. Creare una **NAD** di tipo localnet che referenzia quel nome.

```yaml
cat <<'YAML' | oc apply -f -
apiVersion: k8s.cni.cncf.io/v1
kind: NetworkAttachmentDefinition
metadata:
  name: vlan100-localnet
  namespace: tenant-x
spec:
  config: |
    {
      "cniVersion": "0.4.0",
      "name": "vlan100",
      "type": "ovn-k8s-cni-overlay",
      "topology": "localnet",
      "netAttachDefName": "tenant-x/vlan100-localnet",
      "vlanID": 100,
      "subnets": "192.168.100.0/24"
    }
YAML
```

Il pod la richiede con l'annotation `k8s.v1.cni.cncf.io/networks: vlan100-localnet`.

## localnet vs le alternative

| Serve… | Usa |
| --- | --- |
| Pod/VM su VLAN fisica, nativo OVN | **localnet** |
| Interfaccia extra semplice su NIC | Multus [macvlan/bridge](/multus/plugin/) |
| Line-rate / hardware offload | [SR-IOV](/fisiche/sriov/) |
| Namespace isolato, subnet propria (overlay) | [UDN primaria](/udn/introduzione/) |

:::caution
localnet tocca l'infrastruttura: la VLAN deve esistere e arrivare taggata sulla NIC dei nodi (port group vSphere / switch fisico). Va concordato col team rete.
:::

Nelle versioni recenti puoi definire una localnet anche via `ClusterUserDefinedNetwork` con `role: Secondary`, gestendola come le altre reti OVN.
