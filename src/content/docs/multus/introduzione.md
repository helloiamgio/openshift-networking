---
title: Cos'è Multus
description: Multus come meta-CNI per dare più interfacce di rete a un pod, mantenendo la rete primaria di default.
---

In Kubernetes un pod ha **una sola interfaccia** (oltre alla loopback): `eth0`, gestita dalla CNI primaria (OVN-Kubernetes). **Multus** è un meta-CNI che consente di aggiungere **interfacce secondarie** (`net1`, `net2`, …), ognuna descritta da una CNI diversa.

![Multus: un pod con interfaccia primaria eth0 sulla pod network e interfaccia secondaria net1 verso una VLAN fisica](/diagrams/03-multus.svg)

## Il punto chiave

> Multus **aggiunge** interfacce. La primaria (`eth0`) **resta** sulla pod network di default.

Questo è ciò che distingue Multus dalle UDN: Multus non isola né sostituisce la rete primaria, la affianca. Il pod continua a parlare su `eth0` per Service e DNS, e usa `net1` per il traffico aggiuntivo (es. una VLAN fisica).

## Quando serve

- Collegare un pod a una **VLAN fisica esistente** (storage, backup, rete management, app legacy che vuole un IP "vero").
- **Performance** / line-rate con SR-IOV (telco, CNF, NFV).
- **Multi-homing**: separare data-plane e control-plane su NIC diverse.
- Dare a un workload un **IP statico su rete fisica** indipendente dalla pod network.

## Quando NON serve

Se l'obiettivo è **isolare un namespace** con una sua subnet primaria ("cluster nel cluster"), Multus è lo strumento sbagliato: il pod resterebbe comunque sulla pod network di default come interfaccia primaria. Per quello servono le [UDN](/udn/introduzione/).

## I due pezzi

1. La **[NetworkAttachmentDefinition (NAD)](/multus/nad/)** — la CRD che descrive la rete secondaria.
2. L'**annotation** sul pod che richiede l'attach della NAD.

Vai alla [NAD](/multus/nad/) per la configurazione concreta.
