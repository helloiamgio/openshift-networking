---
title: Nodi/MachineSet su VLAN
description: "Dedicare una VLAN diversa a nodi e MachineSet su vSphere: NIC primaria via networkName e NIC aggiuntiva multi-NIC (novità 4.18)."
---

Sì, è possibile dedicare a certi nodi/MachineSet una **VLAN diversa** da quella originale del cluster. Ma prima va chiarita una distinzione, perché cambia radicalmente l'approccio e i vincoli.

:::note[Due livelli diversi]
- **Rete dei nodi** (questa pagina): la VLAN/subnet su cui vive la NIC del nodo, gestita da **MachineSet** (+ NMState). È livello infrastruttura.
- **Rete secondaria dei pod**: una VLAN aggiuntiva data ai *pod*, gestita da [NAD/localnet](/fisiche/localnet/). È livello workload.

Qui parliamo del primo: segregare i **nodi**.
:::

![MachineSet multi-NIC: NIC primaria sulla VLAN cluster e NIC aggiuntiva su VLAN dedicata](/diagrams/27-machineset-vlan.svg)

## NIC primaria vs NIC aggiuntiva

Nel `MachineSet` vSphere l'interfaccia è definita da `providerSpec.value.network.devices[].networkName`, che punta a un **port group vSphere** (cioè una VLAN).

- **Spostare la NIC primaria** su un'altra VLAN: possibile, ma la rete primaria dei nodi deve restare **instradabile** verso API server, DNS interno e machine network. Non puoi isolare i nodi su una VLAN senza rotta verso il control plane, o non si uniscono al cluster.
- **Aggiungere una NIC dedicata** su un'altra VLAN (il caso "pulito"): è la via consigliata per dedicare una VLAN a un MachineSet, tenendo la primaria per la comunicazione di cluster.

## Novità 4.18: multi-NIC per nodo

Da OpenShift **4.18** i cluster vSphere supportano **fino a 10 NIC per nodo**, così da fornire link dedicati nelle VM dei nodi (storage, database, segregazione). Su un cluster esistente puoi aggiungere subnet/NIC tramite i compute machine set. È esattamente lo strumento per "dedicare una VLAN diversa a un MachineSet".

## MachineSet: una o più reti

Una sola rete (primaria su un port group specifico):

```yaml
spec:
  template:
    spec:
      providerSpec:
        value:
          network:
            devices:
              - networkName: "PG-VLAN-100-cluster"
          template: <vm_template>
```

Più NIC (primaria + VLAN dedicata). La **prima** resta la rete primaria del cluster:

```yaml
spec:
  template:
    spec:
      providerSpec:
        value:
          network:
            devices:
              - networkName: "VM Network"           # primaria (API/DNS)
              - networkName: "PG-VLAN-200-storage"   # VLAN dedicata
          template: <vm_template>
```

Se il cluster è già configurato multi-NIC, recupera i valori dai failure domain:

```bash
oc get infrastructure cluster -o=jsonpath='{.spec.platformSpec.vsphere.failureDomains}'
```

## Configurare la VLAN dentro l'OS (NMState)

Il MachineSet aggancia la NIC al port group; l'indirizzamento e l'eventuale sotto-interfaccia VLAN si configurano con una [NodeNetworkConfigurationPolicy](/fisiche/bridge-nmstate/) che seleziona i **soli nodi di quel MachineSet** via label:

```yaml
cat <<'YAML' | oc apply -f -
apiVersion: nmstate.io/v1
kind: NodeNetworkConfigurationPolicy
metadata:
  name: vlan200-storage
spec:
  nodeSelector:
    machine.openshift.io/cluster-api-machineset: <infra_id>-storage
  desiredState:
    interfaces:
      - name: ens224
        type: ethernet
        state: up
        ipv4:
          enabled: true
          dhcp: true
YAML
oc get nnce
```

## Avvertenze operative

- **Solo macchine nuove**: modificare `network.devices` vale per le macchine create dopo. Procedi per **rolling replacement** (scala il nuovo MachineSet, drena e rimuovi i vecchi nodi), come in una sostituzione `worker-1 → worker-2`.
- `networkName` **sostituisce** le NIC ereditate dal template: se lo specifichi, le interfacce del template vengono scartate e ricreate.
- La primaria deve restare raggiungibile ad API/DNS: valida sempre su **un nodo di test** prima di estendere.

## Documentazione Red Hat (4.18)

- Release notes 4.18 (multi-NIC per nodo + subnet aggiuntive via compute machine set): `https://docs.redhat.com/en/documentation/openshift_container_platform/4.18/html/release_notes/ocp-4-18-release-notes`
- Machine management 4.18 (compute machine set su vSphere, `network.devices.networkName`, multi-NIC): `https://docs.redhat.com/en/documentation/openshift_container_platform/4.18/pdf/machine_management/OpenShift_Container_Platform-4.18-Machine_management-en-US.pdf`
- Installing on vSphere 4.18 ("Configuring multiple NICs"): `https://docs.redhat.com/en/documentation/openshift_container_platform/4.18/html-single/installing_on_vmware_vsphere/index`
- Riferimento YAML multi-NIC (OKD, identico a OCP): `https://docs.okd.io/latest/machine_management/creating_machinesets/creating-machineset-vsphere.html`

In sintesi: **sì**, si dedica una VLAN a nodi/MachineSet — la via consigliata su 4.18 è il **multi-NIC** (VLAN aggiuntiva dedicata), mantenendo la primaria instradabile al control plane.
