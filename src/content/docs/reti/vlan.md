---
title: VLAN e trunking
description: Cosa sono le VLAN (802.1Q), access vs trunk, e perché una VLAN non è un overlay.
---

Una **VLAN** (Virtual LAN) divide uno switch fisico in più segmenti L2 logici e isolati. Due VLAN sullo stesso switch sono domini di broadcast separati: per passare dall'una all'altra serve un router (L3).

![VLAN separate sullo stesso switch, porte access e trunk 802.1Q](/diagrams/18-vlan-trunk.svg)

## 802.1Q e tagging

Il tag VLAN (standard **802.1Q**) è un'etichetta numerica (VLAN ID, 1–4094) inserita nel frame Ethernet. Lo switch usa il tag per tenere separato il traffico delle diverse VLAN sullo stesso cavo.

- **Porta access**: appartiene a una sola VLAN, i frame escono *senza* tag verso il dispositivo finale.
- **Porta trunk**: trasporta *più* VLAN taggate sullo stesso link (es. fra switch, o verso un ipervisore/NIC che ospita più reti).

Su vSphere questo corrisponde ai **port group** con VLAN ID; sulla NIC di un nodo OpenShift una VLAN trunk arriva come sotto-interfaccia (es. `ens192.100`).

## VLAN ≠ overlay

Punto cruciale per non fare confusione con le UDN:

- La **VLAN** è **fisica/infrastrutturale**: vive su switch e NIC, la configura il team rete.
- L'**overlay** (Geneve/VXLAN) è **virtuale/software**: vive dentro OVN, sopra qualsiasi rete fisica, ed è self-service.

Le UDN Layer2/Layer3 sono overlay, **non** VLAN: non richiedono di toccare switch o port group. Le VLAN entrano in gioco solo quando vuoi mettere pod/VM **direttamente** su una rete fisica esistente, tramite [localnet](/fisiche/localnet/), Multus bridge/macvlan o SR-IOV.
