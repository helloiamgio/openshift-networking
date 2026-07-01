---
title: Pod network (Layer3)
description: Come funziona davvero la rete dei pod di default — il blocco /14 affettato in /23 per nodo, routing inter-nodo e Geneve.
---

La rete pod di default di OpenShift usa la topologia **Layer3**. Capirla a fondo è utile perché le [UDN Layer3](/udn/topologie/) funzionano esattamente allo stesso modo, solo in un piano isolato.

![Pod network Layer3: il blocco /14 viene affettato in /23 per nodo, routing inter-nodo via Geneve](/diagrams/02-pod-layer3.svg)

## Affettamento per nodo

Il `clusterNetwork` (default `10.128.0.0/14`) non viene usato tutto insieme: viene **affettato in blocchi `/23`, uno per nodo**, secondo `hostPrefix`.

- `node-1` → `10.128.0.0/23`
- `node-2` → `10.128.2.0/23`
- `node-3` → `10.128.4.0/23`

Con `/23` ogni nodo ha **510 IP utilizzabili** per i pod (512 meno rete e broadcast). Da qui il limite teorico di 510 pod/nodo e ~510 nodi con i default.

:::note[La matematica]
`/14` = 262.144 indirizzi. Diviso in `/23` (512 ciascuno) = 512 blocchi → fino a 510 nodi. Cambiando `hostPrefix` cambi il compromesso nodi ↔ pod-per-nodo.
:::

## Traffico locale vs inter-nodo

- **Stesso nodo**: i pod si parlano tramite uno switch logico OVN locale al nodo. È **L2 locale**, velocissimo, niente incapsulamento.
- **Nodi diversi**: OVN instrada (routing **L3**) verso la slice del nodo di destinazione, **incapsula** il pacchetto in **Geneve** e lo manda sulla machine network al nodo giusto, dove viene scartato e consegnato.

Ecco perché si chiama topologia "Layer3": L2 dentro al nodo, routing L3 fra i nodi. L'overlay Geneve rende tutto questo trasparente: i pod vedono una rete piatta, ma sotto è routing + tunnel.

## Perché ti riguarda

Quando creerai una **UDN Layer3**, OVN replicherà questo identico schema — affettamento per nodo via `hostSubnet`, routing inter-nodo, Geneve — ma nel **CIDR della UDN** e in un **VRF isolato** dal default. Stesso meccanismo, piano separato.

Il passo successivo è scegliere bene quel CIDR: vedi [Pianificazione CIDR](/fondamenti/cidr/).
