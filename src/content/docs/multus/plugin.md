---
title: Plugin e casi d'uso
description: I principali plugin CNI usabili come rete secondaria Multus — bridge, macvlan, ipvlan, SR-IOV — con VLAN e scelta dell'IPAM.
---

La rete secondaria può usare CNI diverse a seconda dell'obiettivo. Ecco le più comuni in OpenShift.

## Plugin principali

| Plugin | Cosa fa | Quando |
| --- | --- | --- |
| `bridge` | Collega i pod a un bridge Linux sul nodo | Reti interne al nodo, VLAN via bridge |
| `macvlan` | Sotto-interfacce con MAC propri sulla NIC fisica | IP "veri" su rete fisica, semplice |
| `ipvlan` | Come macvlan ma condivide il MAC | Ambienti dove i MAC multipli sono limitati |
| `sr-iov` | Virtual Function hardware (VF) | Line-rate, basso overhead (telco/CNF) |
| `host-device` | Sposta una NIC fisica dentro il pod | Accesso esclusivo a un device |

## VLAN tagging

Con il plugin `bridge` puoi taggare una VLAN direttamente:

```json
{
  "cniVersion": "0.3.1",
  "type": "bridge",
  "bridge": "br-vlan",
  "vlan": 100,
  "ipam": { "type": "whereabouts", "range": "10.50.100.0/24" }
}
```

In alternativa, `macvlan` su una sotto-interfaccia VLAN del nodo (es. `ens192.100`) ottiene lo stesso isolamento L2 lato infrastruttura.

:::caution[Coordinamento con il team rete]
A differenza delle UDN, le reti secondarie su VLAN fisica **toccano l'infrastruttura**: la VLAN deve esistere e arrivare taggata sulla NIC dei nodi (port group vSphere / switch fisico). Va concordato con chi gestisce la rete.
:::

## Scelta dell'IPAM

| IPAM | Comportamento | Note |
| --- | --- | --- |
| `static` | IP fissi nel manifest | Pochi pod, controllo totale |
| `dhcp` | Richiede un DHCP relay sul nodo | Dipende da infrastruttura esterna |
| `whereabouts` | IPAM cluster-wide, assegnazione automatica | **Consigliato** per la maggior parte dei casi |

Whereabouts evita i conflitti tipici di `static`/`dhcp` su reti secondarie distribuite su più nodi, tenendo un registro cluster-wide delle assegnazioni.

## SR-IOV in breve

SR-IOV richiede l'**SR-IOV Network Operator**, che gestisce `SriovNetworkNodePolicy` (per esporre le VF) e `SriovNetwork` (che genera la NAD). È la via per performance vicine al bare metal, ma con prerequisiti hardware (NIC compatibili, IOMMU, VF abilitate nel BIOS/host).

Per decidere fra Multus e UDN: [Confronto e scelta](/confronto/).
