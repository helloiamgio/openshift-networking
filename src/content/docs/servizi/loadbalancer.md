---
title: LoadBalancer e MetalLB
description: Come ottenere IP esterni per i Service di tipo LoadBalancer su cluster bare metal o vSphere con MetalLB.
---

Un Service `type: LoadBalancer` chiede un IP esterno. In cloud lo fornisce il provider; **on-prem** (bare metal, vSphere) non c'è nessuno a fornirlo, e senza un componente dedicato il Service resta in `<pending>`. La soluzione è **MetalLB**.

## MetalLB

Installato tramite il **MetalLB Operator**, assegna IP da pool che definisci e li annuncia sulla rete. Due modalità:

- **Layer2**: un nodo "possiede" l'IP e risponde alle ARP/NDP. Semplice, nessun requisito di rete particolare; failover fra nodi.
- **BGP**: i nodi annunciano gli IP via BGP ai router upstream. Scala meglio e distribuisce il traffico, ma richiede router BGP.

```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: pool-prod
  namespace: metallb-system
spec:
  addresses:
    - 192.168.10.100-192.168.10.120
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: l2
  namespace: metallb-system
spec:
  ipAddressPools: [pool-prod]
```

Da qui, un Service `type: LoadBalancer` riceve automaticamente un IP dal pool. MetalLB copre il "buco" del bare metal per il traffico L4; per HTTP/S di solito è più adatta una [Route](/servizi/route-ingress/).
