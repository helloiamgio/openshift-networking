---
title: Architettura e datapath
description: I componenti OVN-Kubernetes dentro un nodo (br-int, ovn_cluster_router, gateway router, br-ex) e come un pacchetto attraversa lo stack.
---

Dentro ogni nodo, OVN-Kubernetes assembla una catena di componenti che porta il traffico dal pod fino alla rete fisica. Conoscerla aiuta a fare troubleshooting e a capire dove agiscono UDN, EgressIP e localnet.

![Datapath OVN-Kubernetes dentro un nodo](/diagrams/06-ovn-datapath.svg)

## I componenti

- **br-int** — il bridge OVS di integrazione: lo **switch logico locale** a cui si attaccano tutti i pod del nodo. Traffico fra pod sullo stesso nodo resta qui (L2 locale).
- **ovn_cluster_router** — il **router distribuito**: instrada fra le subnet dei vari nodi. È logicamente unico ma presente su tutti i nodi.
- **join switch** — collega il router distribuito ai gateway router.
- **gateway router** — gestisce il traffico **nord-sud** (uscita verso l'esterno) e la SNAT.
- **br-ex** — il bridge esterno mappato sulla NIC fisica: il punto in cui il traffico lascia OVN verso la machine network.

## Il percorso di un pacchetto

- **Pod → pod stesso nodo**: entrambi su `br-int`, consegna diretta in L2. Veloce, niente incapsulamento.
- **Pod → pod altro nodo**: `br-int` → `ovn_cluster_router` (routing L3) → incapsulamento **Geneve** → machine network → nodo di destinazione → decapsula → `br-int` → pod.
- **Pod → esterno (nord-sud)**: `ovn_cluster_router` → gateway router (SNAT) → `br-ex` → NIC → rete fisica.

## Dove si innestano gli altri concetti

- Le **UDN** aggiungono switch/router logici paralleli e isolati, con lo stesso schema.
- **EgressIP** e **EgressFirewall** agiscono al gateway router (traffico nord-sud).
- **localnet** collega un switch logico direttamente a `br-ex`/un bridge fisico, saltando l'overlay.
