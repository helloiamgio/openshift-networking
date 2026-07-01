---
title: Service
description: I tipi di Service in OpenShift (ClusterIP, NodePort, LoadBalancer, ExternalName, headless) e il load-balancing nativo OVN.
---

Un **Service** dà un indirizzo stabile a un gruppo di pod effimeri. I pod nascono e muoiono con IP diversi; il Service resta e bilancia il traffico verso quelli sani (gli **EndpointSlice**).

![Flusso di un Service ClusterIP](/diagrams/07-service-flow.svg)

## I tipi

| Tipo | A cosa serve |
| --- | --- |
| **ClusterIP** | VIP interno (default), raggiungibile solo dentro il cluster |
| **NodePort** | espone il Service su una porta di ogni nodo (30000–32767) |
| **LoadBalancer** | chiede un IP esterno a un load-balancer (cloud o [MetalLB](/servizi/loadbalancer/)) |
| **ExternalName** | alias DNS verso un host esterno, nessun proxy |
| **headless** (`clusterIP: None`) | nessun VIP: DNS restituisce direttamente gli IP dei pod |

## Load-balancing senza kube-proxy

In OpenShift il VIP di un ClusterIP (dalla **service network**, default `172.30.0.0/16`) non sta su nessuna interfaccia: è un indirizzo virtuale che **OVN intercetta** e bilancia verso i pod di backend, direttamente nel datapath. Niente `kube-proxy`, niente `iptables` per-Service: è tutto load-balancer OVN.

```bash
oc get svc -n <ns>
oc get endpointslices -n <ns>        # i backend effettivi
oc describe svc <nome> -n <ns>
```

Con una [UDN primaria](/udn/introduzione/) i Service ClusterIP funzionano nativamente anche dentro la rete isolata.
