---
title: OVS e OVN
description: Cosa sono Open vSwitch e OVN, e come OVN-Kubernetes li usa per costruire la rete dei pod.
---

Sotto al networking di OpenShift 4 ci sono due tecnologie: **OVS** e **OVN**. Capirle chiarisce da dove viene tutto il resto.

![Pipeline OVN: da API Kubernetes a NB DB, ovn-northd, SB DB, ovn-controller e flussi OVS](/diagrams/21-ovn-components.svg)

## Open vSwitch (OVS)

**OVS** è uno switch virtuale software programmabile, che gira su ogni nodo. Inoltra i pacchetti in base a regole di flusso (OpenFlow) invece che a una semplice tabella MAC. È il "ferro" virtuale su cui poggia la rete: i bridge come `br-int` e `br-ex` sono bridge OVS.

## OVN (Open Virtual Network)

**OVN** è uno strato di astrazione *sopra* OVS. Invece di programmare i flussi a mano su ogni nodo, descrivi la rete in termini logici — **logical switch**, **logical router**, ACL — e OVN la traduce in flussi OVS su tutti i nodi. Componenti chiave:

- **ovn-northd**: traduce l'intento logico (Northbound DB) in configurazione (Southbound DB).
- **Northbound / Southbound DB**: i database dello stato desiderato e di quello programmato.
- **ovn-controller**: gira su ogni nodo e programma OVS di conseguenza.

## OVN-Kubernetes

**OVN-Kubernetes** è il CNI di default di OpenShift 4: fa da ponte fra l'API Kubernetes e OVN. Quando crei un pod, un Service, una NetworkPolicy o una UDN, OVN-Kubernetes crea gli oggetti logici OVN corrispondenti (switch, router, ACL, load-balancer), che OVN materializza in flussi OVS su ogni nodo.

È per questo che OpenShift **non usa kube-proxy**: bilanciamento dei Service, policy e routing sono tutti nel datapath OVN. Vedi come si compone tutto nel [datapath del nodo](/ovn/architettura/).
