---
title: Introduzione
description: Perché il networking OpenShift confonde, e il modello mentale per capirlo. OVN-Kubernetes, overlay e reti fisiche.
---

Il networking di Kubernetes/OpenShift confonde perché mescola **reti reali** (quelle che esistono fisicamente, su vSphere o sullo switch) e **reti virtuali** (overlay che vivono solo dentro il software di rete). Finché non si separano questi due mondi nella testa, ogni concetto sembra ambiguo.

Questa guida parte da lì: prima il modello a piani, poi come funziona davvero la rete dei pod, poi le due leve per cambiarla — **Multus** (interfacce in più) e **UDN** (rete primaria diversa).

## OVN-Kubernetes in una frase

OpenShift 4 usa **OVN-Kubernetes** come CNI di default: è il componente che assegna gli IP ai pod, configura le rotte e applica le policy di rete. Costruisce una rete **overlay** che astrae la rete fisica sottostante, così i pod hanno un fabric coerente indipendentemente dal fatto che il cluster giri su bare metal, vSphere o cloud.

"Overlay" significa che il traffico fra pod su nodi diversi viene **incapsulato** (protocollo Geneve) e mandato in tunnel sopra la rete fisica dei nodi. I pod non sanno nulla della rete fisica: vedono solo la loro rete virtuale.

## Le due domande che ricorrono

![Le due domande: una NIC in più → Multus, un namespace isolato → UDN](/diagrams/32-intro-scelta.svg)

1. **"Voglio una NIC in più nel pod"** — es. collegare un pod a una VLAN fisica esistente (storage, backup, app legacy), mantenendo la rete pod di default. → È il territorio di **[Multus](/multus/introduzione/)**.

2. **"Voglio un namespace isolato, con una sua subnet, come un cluster nel cluster"** — segregazione vera della rete *primaria* del namespace. → È il territorio delle **[UDN](/udn/introduzione/)**, GA dal 4.18.

Sono cose diverse e si confondono di continuo. La differenza sta tutta in *primaria* vs *secondaria*, ed è il filo conduttore di questa guida.

:::tip
Se hai fretta: leggi [il modello a piani](/fondamenti/modello-piani/) e poi salta direttamente al [confronto Multus vs UDN](/confronto/).
:::
