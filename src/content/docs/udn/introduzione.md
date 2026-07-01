---
title: Cos'è una UDN
description: User-Defined Networks (UDN) in OpenShift 4.18 — reti primarie definite dall'utente per isolare un namespace come cluster nel cluster.
---

Le **User-Defined Networks (UDN)** sono la risposta nativa di OpenShift alla domanda "voglio un namespace isolato con una sua subnet primaria". Sono passate a **GA in OpenShift 4.18** (erano Technology Preview nel 4.17).

:::tip[Chiarimento: UDN è a livello di namespace, non di workload]
Una UDN definisce la **rete primaria di un namespace** a livello OVN-Kubernetes. Vale per **qualsiasi workload** schedulato in quel namespace: pod "puri" e VM (che girano dentro un pod `virt-launcher`) allo stesso modo. **Non è una feature di OpenShift Virtualization**: nasce lato Kubernetes/pod, e Virtualization è solo uno dei suoi consumatori. Per segregare un namespace di soli pod come "cluster nel cluster", la UDN è lo strumento giusto — tipicamente in topologia [Layer3](/udn/topologie/).
:::

![Una UDN e' la rete primaria del namespace: pod e VM insieme prendono l'IP dalla UDN, isolati dal default](/diagrams/11-udn-namespace.svg)

Nel diagramma: nel namespace `tenant-segregato` sia un pod normale sia una VM ottengono `eth0` dalla subnet della UDN (`10.200.x`) e sono isolati dal namespace `default` (che resta sulla pod network `10.128.x`). Il tipo di workload non cambia nulla: conta il namespace.

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
