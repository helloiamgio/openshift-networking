---
title: DNS interno
description: Come funziona la risoluzione DNS nel cluster con CoreDNS, i nomi dei Service e dei pod.
---

Il DNS interno è gestito da **CoreDNS** (operator `dns`), esposto come Service nella service network. Ogni pod ha `/etc/resolv.conf` puntato a CoreDNS, così i nomi dei Service diventano raggiungibili senza conoscere gli IP.

![Risoluzione DNS di un Service via CoreDNS, poi connessione al ClusterIP](/diagrams/12-dns-resolution.svg)

## Nomi dei Service

Un Service `web` nel namespace `shop` è raggiungibile come:

```
web                          # dallo stesso namespace
web.shop                     # da altri namespace
web.shop.svc.cluster.local   # FQDN completo
```

Il dominio di cluster di default è `cluster.local`. CoreDNS risolve il nome nel **ClusterIP** del Service (o, per i Service headless, negli IP dei singoli pod).

## Verifiche

```bash
oc -n <ns> exec <pod> -- getent hosts web.shop.svc.cluster.local
oc -n openshift-dns get pods
oc get dns.operator/default -o yaml
```

Per personalizzazioni (forwarding a DNS esterni, zone aggiuntive) si agisce sull'oggetto `dns.operator/default`. Con una UDN primaria, la risoluzione dei Service interni resta disponibile ai pod isolati.
