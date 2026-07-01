---
title: SR-IOV
description: Interfacce ad alte prestazioni con SR-IOV, Virtual Function e l'operator dedicato.
---

**SR-IOV** (Single Root I/O Virtualization) permette a una NIC fisica di esporre più **Virtual Function (VF)**, ognuna assegnabile direttamente a un pod o una VM. Il traffico bypassa lo stack software del kernel host, avvicinandosi al **line-rate** con latenza bassissima: è la scelta per telco, CNF, NFV e workload data-plane intensivi.

## Componenti

- **SR-IOV Network Operator**: gestisce la configurazione su nodi compatibili.
- **SriovNetworkNodePolicy**: definisce quante VF esporre su quali NIC/nodi e con quale driver.
- **SriovNetwork**: genera la NAD che i pod useranno come rete secondaria.

```yaml
apiVersion: sriovnetwork.openshift.io/v1
kind: SriovNetworkNodePolicy
metadata:
  name: policy-nic1
  namespace: openshift-sriov-network-operator
spec:
  nodeSelector: { feature.node.kubernetes.io/network-sriov.capable: "true" }
  resourceName: sriovnic1
  numVfs: 8
  nicSelector: { pfNames: ["ens1f0"] }
  deviceType: netdevice
```

## Prerequisiti

- NIC compatibili SR-IOV.
- **IOMMU** e virtualizzazione abilitati nel BIOS/firmware.
- VF abilitabili a livello host.

È l'opzione più performante ma anche la più legata all'hardware: a differenza di [localnet](/fisiche/localnet/) e Multus software (macvlan/bridge), richiede supporto fisico specifico.
