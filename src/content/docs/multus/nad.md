---
title: NetworkAttachmentDefinition
description: La CRD NetworkAttachmentDefinition (NAD) e come un pod richiede l'attach di una rete secondaria Multus.
---

La **NetworkAttachmentDefinition** (NAD) è la CRD `k8s.cni.cncf.io/v1` che descrive una rete secondaria. È **namespaced**: vive in un namespace e di norma i pod dello stesso namespace la usano.

## NAD macvlan + whereabouts

Esempio: interfaccia secondaria su una NIC fisica (`ens192`), con IPAM gestito da Whereabouts (IPAM cluster-wide, evita conflitti).

```yaml
cat <<'EOF' | oc apply -f -
apiVersion: k8s.cni.cncf.io/v1
kind: NetworkAttachmentDefinition
metadata:
  name: macvlan-storage
  namespace: tenant-x
spec:
  config: |
    {
      "cniVersion": "0.3.1",
      "type": "macvlan",
      "master": "ens192",
      "mode": "bridge",
      "ipam": {
        "type": "whereabouts",
        "range": "192.168.50.0/24",
        "gateway": "192.168.50.1"
      }
    }
EOF
```

## Richiederla da un pod

Il pod chiede l'attach con l'annotation `k8s.v1.cni.cncf.io/networks`:

```yaml
cat <<'EOF' | oc apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: app-multi-nic
  namespace: tenant-x
  annotations:
    k8s.v1.cni.cncf.io/networks: macvlan-storage
spec:
  containers:
    - name: app
      image: registry.access.redhat.com/ubi9/ubi-minimal
      command: ["sleep", "infinity"]
EOF
```

Verifica le interfacce nel pod:

```bash
oc -n tenant-x exec app-multi-nic -- ip -br addr
# eth0  -> pod network (default, OVN-K)
# net1  -> 192.168.50.x (macvlan, rete secondaria)
```

## Sintassi estesa (NAD da un altro namespace, IP statico)

```yaml
metadata:
  annotations:
    k8s.v1.cni.cncf.io/networks: |
      [
        { "name": "macvlan-storage", "namespace": "shared-net", "ips": ["192.168.50.42/24"] }
      ]
```

## Via Cluster Network Operator (alternativa dichiarativa)

Puoi anche definire reti aggiuntive nel CNO, che genera la NAD per te:

```yaml
apiVersion: operator.openshift.io/v1
kind: Network
metadata:
  name: cluster
spec:
  additionalNetworks:
    - name: macvlan-storage
      namespace: tenant-x
      type: Raw
      rawCNIConfig: '{"cniVersion":"0.3.1","type":"macvlan","master":"ens192","mode":"bridge","ipam":{"type":"whereabouts","range":"192.168.50.0/24"}}'
```

:::tip[GitOps]
Per un flusso GitOps, le NAD dirette (`kind: NetworkAttachmentDefinition`) sono più semplici da versionare e applicare per-namespace. La via CNO è comoda quando vuoi una gestione centralizzata cluster-wide.
:::
