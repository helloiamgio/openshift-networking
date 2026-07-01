---
title: Il modello a piani
description: I tre piani di rete di OpenShift — machine, pod, service — e la regola d'oro su cosa è fisico e cosa è overlay.
---

In un cluster OpenShift convivono più reti con CIDR diversi. La confusione nasce dal trattarle tutte allo stesso modo. In realtà si dividono in **un piano fisico** e **più piani virtuali** sovrapposti.

![Piani di rete OpenShift: machine network fisica con overlay pod, service e UDN](/diagrams/01-piani-rete.svg)

## La regola d'oro

> Delle reti del cluster, **solo la machine network è fisica**. Pod network, service network e UDN sono overlay virtuali che vivono *dentro* OVN-Kubernetes, sopra la machine network.

Questo è il fulcro. Una volta interiorizzato, le UDN smettono di sembrare magia: sono semplicemente **un altro piano virtuale**, parallelo e isolato.

## I tre CIDR che hai già

| Rete | Default tipico | Natura | A cosa serve |
| --- | --- | --- | --- |
| **machine network** | `10.0.0.0/16` | Fisica (vSphere) | Subnet reale dei nodi; ogni nodo ha una NIC qui |
| **pod network** (clusterNetwork) | `10.128.0.0/14` | Overlay | IP dei pod, affettata per nodo |
| **service network** | `172.30.0.0/16` | Overlay (VIP) | IP virtuali dei Service (ClusterIP), nessuna NIC reale |

La **service network** è la più astratta: i suoi indirizzi non stanno su nessuna interfaccia: sono VIP che OVN intercetta e bilancia verso i pod di backend.

## Come leggerli dal tuo cluster

```bash
# pod network + hostPrefix e service network
oc get network.config/cluster -o jsonpath='{"pod:     "}{.spec.clusterNetwork[0].cidr}{"  hostPrefix /"}{.spec.clusterNetwork[0].hostPrefix}{"\nservice: "}{.spec.serviceNetwork[0]}{"\n"}'

# machine network = la subnet vera dei nodi
oc get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.addresses[?(@.type=="InternalIP")].address}{"\n"}{end}'
```

Tieni a portata di mano questi valori: serviranno per [pianificare i CIDR](/fondamenti/cidr/) di Multus e UDN senza collisioni.
