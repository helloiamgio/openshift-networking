---
title: Layer2 vs Layer3
description: Le due topologie delle UDN — Layer2 segmento piatto e Layer3 con subnet per nodo — quando usare l'una o l'altra.
---

Una UDN primaria può avere due topologie. Importante: **non sono VLAN**. Sono entrambe overlay OVN (incapsulamento Geneve), non toccano vSphere né la rete fisica.

![Topologie UDN: Layer2 segmento piatto unico contro Layer3 con subnet per nodo e routing](/diagrams/04-udn-topologie.svg)

## Layer2 — segmento piatto

Un unico segmento L2 su tutti i nodi: stessa subnet ovunque (es. `10.200.0.0/16` valida su qualsiasi nodo). I pod si vedono direttamente, come in un open-space.

```yaml
cat <<'EOF' | oc apply -f -
apiVersion: k8s.ovn.org/v1
kind: UserDefinedNetwork
metadata:
  name: primary-net
  namespace: tenant-segregato
spec:
  topology: Layer2
  layer2:
    role: Primary
    subnets:
      - 10.200.0.0/16
EOF
```

**Quando**: VM (live-migration, IP stabile), app che vogliono stare nella stessa subnet, semplicità.

## Layer3 — subnet per nodo

Ogni nodo riceve una fetta della subnet (`hostSubnet`) e OVN fa il routing fra i nodi. È **lo stesso schema della pod-network di default**, ma isolato.

```yaml
cat <<'EOF' | oc apply -f -
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
EOF
```

**Quando**: workload a pod (non VM), scalabilità su molti nodi. È la scelta naturale se hai pod e non macchine virtuali.

## Come scegliere

| | Layer2 | Layer3 |
| --- | --- | --- |
| Struttura | Segmento piatto unico | Subnet per nodo + routing |
| Modello mentale | Open-space | Stanze collegate da router |
| IP che "segue" il workload | Sì (ottimo per VM) | No |
| Scala su molti nodi | Buona | Migliore |
| Caso tipico | VM / OpenShift Virtualization | Pod |

:::note
Entrambe con `role: Primary` fanno sì che i pod abbiano **solo** questa rete come primaria, isolata dal default. Esiste anche `role: Secondary` per usare la UDN come rete aggiuntiva (alternativa nativa a Multus).
:::
