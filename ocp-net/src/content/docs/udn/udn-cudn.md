---
title: UDN vs CUDN
description: Differenza fra UserDefinedNetwork (namespace) e ClusterUserDefinedNetwork (multi-namespace via selector).
---

Le due CRD coprono due scope diversi.

## UserDefinedNetwork (namespace)

Vive in **un namespace** e isola quel namespace. Una rete = un tenant.

```yaml
apiVersion: k8s.ovn.org/v1
kind: UserDefinedNetwork
metadata:
  name: primary-net
  namespace: tenant-segregato
spec:
  topology: Layer3
  layer3:
    role: Primary
    subnets:
      - cidr: 10.200.0.0/16
        hostSubnet: 24
```

## ClusterUserDefinedNetwork (multi-namespace)

È **cluster-scoped** e seleziona uno o più namespace via `namespaceSelector`. I namespace selezionati condividono la stessa rete primaria, restando isolati dagli altri. Nota la config annidata sotto `spec.network`.

```yaml
cat <<'EOF' | oc apply -f -
apiVersion: k8s.ovn.org/v1
kind: ClusterUserDefinedNetwork
metadata:
  name: cudn-prod
spec:
  namespaceSelector:
    matchLabels:
      cudn: prod
  network:
    topology: Layer2
    layer2:
      role: Primary
      subnets:
        - 10.100.0.0/16
EOF
```

Poi i namespace che vuoi includere devono avere **entrambe** le label, al momento della creazione:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app-prod-1
  labels:
    k8s.ovn.org/primary-user-defined-network: ""
    cudn: prod
```

## Quale usare

| Esigenza | CRD |
| --- | --- |
| Un singolo namespace isolato | `UserDefinedNetwork` |
| Più namespace che si parlano fra loro ma isolati dagli altri | `ClusterUserDefinedNetwork` |
| Separazione control-plane / data-plane fra tenant | `ClusterUserDefinedNetwork` |

:::caution[Immutabilità]
La configurazione di rete di una UDN/CUDN è di fatto immutabile: per cambiarla si crea una nuova risorsa e si riassegna. Pianifica CIDR e topologia prima di applicare in produzione.
:::
