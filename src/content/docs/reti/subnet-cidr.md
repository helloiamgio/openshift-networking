---
title: Subnet e notazione CIDR
description: Come leggere una subnet in notazione CIDR, quanti host contiene, e gli intervalli privati.
---

La notazione **CIDR** (`10.0.0.0/24`) descrive un blocco di indirizzi IP. Il numero dopo lo slash è il **prefisso**: quanti bit iniziali sono fissi (la parte "rete"). I bit restanti identificano gli host.

## Come si legge

Un indirizzo IPv4 ha 32 bit. Il prefisso divide rete e host:

| CIDR | Bit host | Indirizzi | Host utili | Nota |
| --- | --- | --- | --- | --- |
| `/24` | 8 | 256 | 254 | classica LAN |
| `/23` | 9 | 512 | 510 | slice per nodo pod-net |
| `/16` | 16 | 65.536 | 65.534 | rete ampia |
| `/8` | 24 | 16,7M | — | intera "net 10" |

Host utili = totale − 2 (indirizzo di rete e broadcast). Più piccolo è il prefisso (`/8`), più grande è il blocco.

## Regola pratica

- Prefisso **più grande** (verso `/32`) = blocco **più piccolo**.
- `/24` → 256 indirizzi, `/25` → 128, `/26` → 64, e così via dimezzando.
- Due CIDR **si sovrappongono** se uno contiene l'altro o condividono indirizzi: è ciò che devi evitare quando pianifichi reti aggiuntive.

## Intervalli privati (RFC 1918)

Usa questi per reti interne e overlay, mai indirizzi pubblici altrui:

- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`

Per la scelta concreta di un CIDR in OpenShift senza collisioni (inclusi i range riservati di OVN), vedi [Pianificazione CIDR](/fondamenti/cidr/).
