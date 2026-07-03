---
title: DHCP e IP dei nodi
description: "Come i nodi OpenShift ottengono l'IP su vSphere IPI: il DHCP esterno, lo scambio DORA, lease, reservation e relay, con troubleshooting dei nodi senza IP."
---

Su OpenShift **IPI vSphere** i nodi RHCOS prendono l'IP primario da un **DHCP esterno** — quello della tua rete/VLAN. Non esiste un DHCP *interno* al cluster (quello c'è solo su IPI bare metal). Capire come funziona il DHCP è quindi essenziale per diagnosticare i "nodi senza IP".

## Cosa fa il DHCP

Ogni macchina in rete ha bisogno di 4 cose: **IP**, **subnet mask**, **gateway** e **DNS**. Il DHCP (Dynamic Host Configuration Protocol) le assegna automaticamente: il client che si accende senza IP "chiede" e il server "assegna". Il server tiene un **pool** (un intervallo di IP da distribuire) e le opzioni da consegnare.

## Lo scambio DORA

Client e server si parlano in 4 messaggi, ricordati con **DORA**:

![Scambio DHCP DORA fra nodo e server, con note su lease, reservation e relay](/diagrams/16-dhcp-dora.svg)

1. **Discover** — il client grida "c'è un DHCP? mi serve un IP". È un **broadcast** (non ha ancora IP) e si identifica col suo **MAC**.
2. **Offer** — il server risponde "ti offro `10.0.5.87` + mask + gateway + DNS".
3. **Request** — il client dice "accetto proprio quello" (serve anche a scegliere fra più server).
4. **Ack** — il server conferma; il client configura la NIC e va in rete.

In console del nodo: `Discover → Offer → Request → Ack` = DHCP ok. Tanti `Discover` **senza** `Offer` = il server non risponde o non lo raggiungi.

## Lease: l'IP è in affitto

L'IP non è tuo per sempre: è dato in **affitto (lease)** per un tempo definito. Prima della scadenza il client prova a **rinnovare**; se il server è irraggiungibile e il lease scade del tutto, **il client perde l'IP**. Ecco perché un cluster che "prima funzionava" può ritrovarsi con nodi senza IP: non è cambiato il nodo, è scaduto il lease e il rinnovo è fallito.

## Reservation: IP stabile per un MAC

Il server può essere configurato con una **reservation**: "al MAC `00:50:56:aa:bb:cc` assegna **sempre** `10.0.5.87`". Su vSphere IPI è la prassi consigliata, perché kubelet, etcd e i **certificati** sono legati a IP/hostname: l'IP dei nodi deve restare stabile. Se una VM viene ricreata/clonata **cambia MAC** → la vecchia reservation non matcha più → niente IP riservato (causa tipica).

## Relay: dov'è il server?

Il `Discover` è un broadcast, e **i broadcast non attraversano i router**: restano nella propria VLAN.

- Server DHCP **sulla stessa VLAN** dei nodi → sente direttamente i Discover.
- Server **su un'altra subnet** (DHCP centralizzato) → serve che il router della VLAN faccia da **relay** (`ip helper-address <ip_dhcp>`): inoltra il broadcast in unicast al server e riporta indietro la risposta. Se qualcuno tocca quel relay, i nodi smettono di ricevere IP pur essendo il server perfettamente funzionante.

## Sul cluster OpenShift (vSphere IPI)

- Gli **IP dei nodi** dipendono al 100% dal **DHCP esterno**: OpenShift non ne gestisce l'assegnazione.
- I **VIP** `api` e `ingress` sono un'altra cosa: sono gestiti internamente da **keepalived** (static pod), non dal DHCP.
- Consigliato: **reservation** con lease lunghi per i nodi.
- Alternativa robusta: **IP statici** via `networkData` nel `Machine`/`MachineSet` (ipAddrs, gateway, nameservers), così i nodi non dipendono più dal DHCP.

## Troubleshooting: nodo senza IP

Il nodo senza IP non è raggiungibile: usa la **console della VM in vSphere**.

```bash
# in console del nodo
ip -br a                      # la NIC ha un IP? o è vuota / solo link-local?
ip link                       # interfaccia UP? c'è carrier?
nmcli device status
journalctl -u NetworkManager -b | grep -iE 'dhcp|lease|offer|discover'
# cattura lo scambio DHCP mentre riavvii la rete:
tcpdump -ni <iface> port 67 or port 68
```

Interpretazione:

- **Discover non escono** → problema NIC/link/**port group vSphere** (VM disconnessa o VLAN sbagliata), non il DHCP.
- **Discover escono ma niente Offer** → server giù, **relay** rotto, o **pool esaurito**. Un `tcpdump` sul server dice se i Discover arrivano: se non arrivano è L2/relay; se arrivano e non risponde è server/pool.
- **IP diverso da prima** → kubelet/etcd si rompono e restano **CSR pending** (certificati legati a IP/hostname): da qui l'importanza della reservation.

In vSphere, verifica sempre che la NIC della VM sia **Connected**, sul **port group giusto** e con il **VLAN ID** corretto (tipico rompersi dopo un vMotion su host senza quel port group).

:::tip[Collegato]
Se stai dedicando una VLAN a certi nodi, vedi [Nodi/MachineSet su VLAN](/fisiche/nodi-vlan-machineset/): lì l'IP dei nuovi nodi dipende dal DHCP di quella VLAN (o dagli IP statici via `networkData`).
:::
