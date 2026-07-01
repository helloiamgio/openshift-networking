---
title: Confronto e scelta
description: Multus o UDN? Tabella comparativa e albero decisionale per scegliere fra rete secondaria e rete primaria isolata.
---

La confusione fra Multus e UDN si risolve con una domanda sola: **vuoi una NIC in più, o vuoi sostituire la rete primaria?**

## Tabella comparativa

| | Multus (rete secondaria) | UDN primaria |
| --- | --- | --- |
| Cosa fa | **Aggiunge** `net1`, `net2`… | **Sostituisce** la primaria `eth0` |
| Interfaccia primaria del pod | Resta sulla pod network default | È la UDN isolata |
| Isolamento tenant | No (solo una NIC extra) | **Sì, di default** |
| Subnet propria | Sì, sulla rete secondaria | Sì, primaria |
| Service ClusterIP / DNS | Solo su `eth0` (default) | Nativi sulla UDN |
| EgressIP / route | Non nativi sulla secondaria | Supportati nativamente |
| Tocca l'infrastruttura fisica | Spesso sì (VLAN, NIC) | No (overlay OVN) |
| Caso d'uso tipico | NIC su VLAN storage/backup, SR-IOV | "Cluster nel cluster", multi-tenancy |

## Albero decisionale

1. **Vuoi isolare un namespace con una sua rete primaria** ("cluster nel cluster", multi-tenancy)?
   → **UDN primaria**. Layer3 per pod, Layer2 per VM.

2. **Ti serve una NIC in più** verso una VLAN fisica esistente (storage, backup, app legacy), mantenendo la rete pod di default?
   → **Multus** (`bridge`/`macvlan`) oppure **UDN `role: Secondary`** se vuoi restare nativo OVN.

3. **Ti serve line-rate / hardware offload** (telco, CNF)?
   → **Multus + SR-IOV**.

4. **Hai VM** che richiedono IP stabile e live-migration?
   → **UDN Layer2 primaria** (integrazione OpenShift Virtualization).

## Sintesi

- **Multus** = interfacce in più. La primaria non cambia. Spesso coinvolge l'infrastruttura fisica.
- **UDN** = la rete primaria del namespace cambia ed è isolata. Tutto overlay OVN, self-service, niente VLAN da chiedere.

Per il caso "namespace segregato a livello di rete", la risposta nel 4.18 è **UDN**, non Multus. Vedi il [runbook operativo](/pratica/runbook-udn/).
