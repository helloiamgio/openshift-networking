---
title: OSI e TCP/IP
description: I livelli di rete OSI e TCP/IP, l'incapsulamento, e dove si collocano i concetti di Kubernetes/OpenShift.
---

Per capire il networking di OpenShift serve una mappa mentale dei livelli. Il modello **OSI** (7 livelli) è didattico; il modello **TCP/IP** (4 livelli) è quello reale di Internet. Ogni livello parla col suo pari sull'altra macchina e usa i servizi del livello sotto.

![Mappatura fra i 7 livelli OSI e i 4 livelli TCP/IP](/diagrams/05-osi-tcpip.svg)

## Incapsulamento

Un dato scende lo stack aggiungendo header a ogni livello: l'app produce un payload (L7), il trasporto aggiunge porte (L4, segmento TCP/UDP), la rete aggiunge gli IP (L3, pacchetto), il data link aggiunge i MAC (L2, frame). In ricezione si risale togliendo header. Un **overlay** come Geneve è semplicemente un incapsulamento in più: il frame del pod viene messo *dentro* un pacchetto UDP che viaggia sulla rete fisica.

## Un oggetto per livello: rete tradizionale vs k8s/OCP

Il modo più veloce per "sentire" i livelli è associare a ognuno un **oggetto concreto**, prima nel mondo di rete classico e poi nel suo equivalente Kubernetes/OpenShift.

| Livello | Rete tradizionale | Kubernetes / OpenShift |
| --- | --- | --- |
| **L7** Applicazione | richiesta HTTP, record DNS | [Route/Ingress](/servizi/route-ingress/), nome DNS del [Service](/servizi/dns/) |
| **L6** Presentazione | certificato TLS, cifratura | Secret TLS, terminazione TLS sulla Route |
| **L5** Sessione | sessione/socket TCP | connessione keep-alive verso un Service |
| **L4** Trasporto | porta TCP/UDP | `port`/`targetPort` del Service, porte in [NetworkPolicy](/sicurezza/networkpolicy/) |
| **L3** Rete | indirizzo IP, subnet, router | [pod IP](/fondamenti/pod-network/), `clusterNetwork`, `ovn_cluster_router`, [EgressIP](/servizi/egress/) |
| **L2** Data Link | MAC, switch, [VLAN](/reti/vlan/) | `br-int` (OVS), [UDN Layer2](/udn/topologie/), NAD [localnet](/fisiche/localnet/) (`vlanID`) |
| **L1** Fisico | NIC, cavo, port group vSphere | NIC del nodo (`ens192`), `br-ex`, VF [SR-IOV](/fisiche/sriov/) |

La regola pratica da portarsi via: **L2 = "stessa stanza" (switching, si parlano diretti); L3 = "stanze diverse collegate da router"**. Tutto il resto del networking OpenShift è una variazione su questo tema.
