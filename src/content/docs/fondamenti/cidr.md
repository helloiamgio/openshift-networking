---
title: Pianificazione CIDR
description: Come scegliere il CIDR di una rete aggiuntiva o di una UDN senza collisioni, inclusi i range interni riservati di OVN-Kubernetes.
---

Sia Multus sia le UDN richiedono di scegliere una subnet. La regola è una sola: **non deve sovrapporsi a niente di già occupato nel cluster** (e a nessuna rete fisica raggiungibile).

![Range occupati e riservati OVN da evitare, con un blocco libero scelto per la UDN](/diagrams/22-cidr-planning.svg)

## I range da evitare

| Categoria | Valore | Note |
| --- | --- | --- |
| pod network | `10.128.0.0/14` (default) | Leggi il tuo con `oc get network.config/cluster` |
| service network | `172.30.0.0/16` (default) | — |
| machine network | es. `10.0.0.0/16` | + storage, backup, DB esterni raggiungibili |
| **OVN join** | `100.64.0.0/16` | Riservato interno OVN-K |
| **OVN transit** | `100.88.0.0/16` | Riservato interno OVN-K |
| **OVN masquerade** | `169.254.0.0/17` | Riservato interno OVN-K |

:::danger[Mai usare i range OVN interni]
`100.64.0.0/16`, `100.88.0.0/16` e `169.254.0.0/17` sono usati internamente da OVN-Kubernetes (join switch, transit switch, masquerade). Non vederli nella config non significa che siano liberi: usarli rompe il cluster.
:::

## La regola della sovrapposizione (cruciale per le UDN)

- Una UDN **non deve** sovrapporsi a pod/service/machine network e ai range OVN.
- Una UDN **può** sovrapporsi liberamente ad **altre UDN**: ogni UDN è un VRF isolato, quindi due tenant possono usare entrambi `10.200.0.0/16` senza conflitto.

Questo è uno dei vantaggi chiave rispetto alla pod-network monolitica: niente più caccia disperata a blocchi liberi per ogni tenant.

## Check di non-collisione

```bash
# CIDR già in uso che NON devi toccare
oc get network.config/cluster -o jsonpath='{"pod:     "}{.spec.clusterNetwork[0].cidr}{"\nservice: "}{.spec.serviceNetwork[0]}{"\n"}'
oc get nodes -o jsonpath='{range .items[*]}{.status.addresses[?(@.type=="InternalIP")].address}{"\n"}{end}'
# riservati OVN (sempre): 100.64.0.0/16  100.88.0.0/16  169.254.0.0/17
```

Scegli un blocco privato pulito e inutilizzato (es. `10.200.0.0/16`, `192.168.0.0/16`). Se non rientra in nessuno dei punti sopra, sei a posto.

## hostSubnet (solo Layer3)

Nelle UDN/reti Layer3 il campo `hostSubnet` è l'equivalente esatto di `hostPrefix` della pod-network: la **fetta per nodo**. Con `hostSubnet: 24` dai 254 IP a pod per nodo dentro al CIDR della UDN.
