---
title: Bridge e NMState
description: Configurare bridge e VLAN sulle NIC dei nodi in modo dichiarativo con l'operator NMState e le NodeNetworkConfigurationPolicy.
---

Per portare una VLAN fisica dentro il cluster (per [localnet](/fisiche/localnet/), Multus bridge o VM su bridge) serve configurare bridge e sotto-interfacce **sulle NIC dei nodi**. Farlo a mano non è ripetibile: OpenShift usa l'**NMState Operator** e le **NodeNetworkConfigurationPolicy (NNCP)**, dichiarative e versionabili.

## I tre oggetti

- **NodeNetworkState (NNS)**: sola lettura, mostra lo stato di rete attuale di ogni nodo.
- **NodeNetworkConfigurationPolicy (NNCP)**: lo **stato desiderato** da applicare (a tutti i nodi o a un sottoinsieme via nodeSelector).
- **NodeNetworkConfigurationEnrollment (NNCE)**: il risultato dell'applicazione, per nodo.

## Esempio: bridge OVS con VLAN per localnet

```yaml
cat <<'YAML' | oc apply -f -
apiVersion: nmstate.io/v1
kind: NodeNetworkConfigurationPolicy
metadata:
  name: br-vlan100
spec:
  nodeSelector:
    node-role.kubernetes.io/worker: ""
  desiredState:
    interfaces:
      - name: br-vlan100
        type: ovs-bridge
        state: up
        bridge:
          port:
            - name: ens192
    ovn:
      bridge-mappings:
        - localnet: vlan100          # nome referenziato dalla NAD localnet
          bridge: br-vlan100
          state: present
YAML
```

## Verifiche

```bash
oc get nncp
oc get nnce
oc get nns <nodo> -o yaml | less     # stato di rete del nodo
```

:::caution
Modificare la rete dei nodi è un'operazione delicata (banking): applica prima su un nodo di test tramite nodeSelector, verifica l'NNCE, poi estendi. Un errore nella NNCP può isolare un nodo.
:::
