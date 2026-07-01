---
title: Overlay e underlay
description: La differenza fra rete fisica (underlay) e rete virtuale (overlay), e perché Kubernetes usa un overlay.
---

Due parole ricorrono in tutto il networking dei container: **underlay** e **overlay**. Distinguerle chiarisce cosa è "vero" e cosa è "virtuale".

## Underlay — la rete fisica

L'**underlay** è la rete reale che collega i nodi: switch, cavi, NIC, la subnet vSphere. È ciò che esiste indipendentemente da Kubernetes. In OpenShift corrisponde alla **machine network**.

## Overlay — la rete virtuale

Un **overlay** è una rete logica costruita *sopra* l'underlay tramite **incapsulamento**: il traffico virtuale viene messo dentro pacchetti che viaggiano sulla rete fisica. I due protocolli tipici sono **VXLAN** e **Geneve** (quello di OVN-Kubernetes).

Il pod vede una rete piatta e coerente; sotto, il suo frame viene incapsulato in un pacchetto UDP Geneve, spedito al nodo giusto sull'underlay, e lì scartato.

## Perché Kubernetes usa un overlay

- **Indipendenza dall'infrastruttura**: i pod hanno IP e connettività uguali su bare metal, vSphere o cloud, senza chiedere subnet/VLAN al team rete per ogni namespace.
- **Mobilità**: i pod nascono e muoiono ovunque; l'overlay li segue.
- **Isolamento self-service**: nuove reti isolate (le [UDN](/udn/introduzione/)) si creano con una CRD, non riconfigurando switch.

Il prezzo è un piccolo overhead di incapsulamento e un MTU leggermente ridotto. Quando serve invece stare **direttamente** sull'underlay (performance, integrazione con reti fisiche esistenti), si usano [localnet](/fisiche/localnet/), Multus o SR-IOV.
