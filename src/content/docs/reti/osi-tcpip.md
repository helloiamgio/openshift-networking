---
title: OSI e TCP/IP
description: I livelli di rete OSI e TCP/IP, l'incapsulamento, e dove si collocano i concetti di Kubernetes/OpenShift.
---

Per capire il networking di OpenShift serve una mappa mentale dei livelli. Il modello **OSI** (7 livelli) è didattico; il modello **TCP/IP** (4 livelli) è quello reale di Internet. Ogni livello parla col suo pari sull'altra macchina e usa i servizi del livello sotto.

![Mappatura fra i 7 livelli OSI e i 4 livelli TCP/IP](/diagrams/05-osi-tcpip.svg)

## Incapsulamento

Un dato scende lo stack aggiungendo header a ogni livello: l'app produce un payload (L7), il trasporto aggiunge porte (L4, segmento TCP/UDP), la rete aggiunge gli IP (L3, pacchetto), il data link aggiunge i MAC (L2, frame). In ricezione si risale togliendo header. Un **overlay** come Geneve è semplicemente un incapsulamento in più: il frame del pod viene messo *dentro* un pacchetto UDP che viaggia sulla rete fisica.

## Dove vivono i concetti OCP

| Concetto OCP | Livello |
| --- | --- |
| HTTP/Route, DNS | L7 |
| Service (porte), NetworkPolicy L4 | L4 |
| pod IP, routing OVN, Geneve | L3 |
| VLAN, bridge, MAC, ARP | L2 |
| NIC, port group vSphere | L1/L2 |

La regola pratica: **L2 = "stessa stanza" (switching, si parlano diretti); L3 = "stanze diverse collegate da router"**. Tutto il resto del networking OpenShift è una variazione su questo tema.
