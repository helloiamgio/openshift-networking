---
title: Egress (uscita controllata)
description: Controllare il traffico in uscita dei pod con EgressIP, EgressFirewall ed Egress Router.
---

Per default i pod escono verso l'esterno con SNAT sull'IP del nodo. Spesso però serve **controllare l'uscita**: un IP sorgente stabile per i firewall esterni, o limitare le destinazioni raggiungibili. OVN-Kubernetes offre tre strumenti.

## EgressIP — IP sorgente stabile

Assegna un **IP sorgente fisso** al traffico in uscita di uno o più namespace, ospitato su nodi designati. Utile quando un sistema esterno (DB, API di terze parti) accetta connessioni solo da IP in allowlist.

![Percorso EgressIP: i pod escono con un IP sorgente stabile in allowlist](/diagrams/14-egressip.svg)

```yaml
apiVersion: k8s.ovn.org/v1
kind: EgressIP
metadata:
  name: egress-prod
spec:
  egressIPs: [192.168.10.50]
  namespaceSelector:
    matchLabels:
      egress: prod
```

I nodi che possono ospitare l'IP vanno etichettati (`k8s.ovn.org/egress-assignable`).

## EgressFirewall — limitare le destinazioni

Regola, **per namespace**, verso quali destinazioni esterne i pod possono uscire, con regole ordinate Allow/Deny su CIDR o nomi DNS.

```yaml
apiVersion: k8s.ovn.org/v1
kind: EgressFirewall
metadata:
  name: default
  namespace: tenant-x
spec:
  egress:
    - type: Allow
      to: { cidrSelector: 10.20.0.0/16 }
    - type: Deny
      to: { cidrSelector: 0.0.0.0/0 }
```

## Egress Router

Un pod dedicato che fa da **gateway** verso una rete esterna specifica, con un IP sorgente noto — utile per integrazioni legacy che richiedono un unico punto di uscita.

Questi strumenti agiscono sul traffico nord-sud al gateway router e si combinano con le [NetworkPolicy](/sicurezza/networkpolicy/) per le regole est-ovest.
