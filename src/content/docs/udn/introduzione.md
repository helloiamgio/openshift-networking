---
title: Cos'è una UDN
description: User-Defined Networks (UDN) in OpenShift 4.18 — reti primarie definite dall'utente per isolare un namespace come cluster nel cluster.
---

Le **User-Defined Networks (UDN)** sono la risposta nativa di OpenShift alla domanda "voglio un namespace isolato con una sua subnet primaria". Sono passate a **GA in OpenShift 4.18** (erano Technology Preview nel 4.17).

## L'idea

Una UDN con `role: Primary` **sostituisce la rete primaria** del namespace: i pod prendono `eth0` da una **subnet tua**, in un segmento OVN **isolato di default** dal resto del cluster. È esattamente il concetto di "cluster nel cluster".

A differenza di Multus (che aggiunge interfacce secondarie lasciando la primaria sul default), la UDN primaria **è** la rete primaria del pod.

## Cosa ti dà

- **Isolamento di default**: i segmenti UDN sono separati senza bisogno di NetworkPolicy. La NetworkPolicy resta supportata per micro-segmentazione fine.
- **Subnet tua**: scegli il CIDR (anche [sovrapposto ad altre UDN](/fondamenti/cidr/)).
- **Cittadinanza di prima classe**: supporto pieno a Service ClusterIP, EgressIP e route — cosa che le reti secondarie Multus non hanno nativamente.
- **VM-friendly**: IP statico per la vita della VM e rete L2 primaria per la live-migration (integrazione con OpenShift Virtualization).

## Due CRD

| CRD | Scope | Uso |
| --- | --- | --- |
| `UserDefinedNetwork` | Namespace singolo | Un tenant/progetto isolato |
| `ClusterUserDefinedNetwork` | Cluster (via `namespaceSelector`) | Rete condivisa fra più namespace, isolata dagli altri |

Dettagli in [UDN vs CUDN](/udn/udn-cudn/).

## Il vincolo da conoscere subito

:::danger[Label al momento della creazione]
Per una UDN **primaria**, il namespace deve avere la label `k8s.ovn.org/primary-user-defined-network: ""` **alla creazione**. Non è applicabile a un namespace già esistente: va creato nuovo.
:::

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: tenant-segregato
  labels:
    k8s.ovn.org/primary-user-defined-network: ""
```

Prosegui con le [topologie Layer2 vs Layer3](/udn/topologie/).
