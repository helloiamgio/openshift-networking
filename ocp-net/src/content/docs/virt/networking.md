---
title: Networking di OpenShift Virtualization
description: Come collegare le VM in OpenShift Virtualization — masquerade sulla pod network, UDN Layer2 per la live-migration, bridge e localnet su VLAN fisica.
---

In **OpenShift Virtualization** una VM gira dentro un pod (`virt-launcher`), quindi eredita il modello di rete dei pod, con opzioni pensate per i workload virtualizzati. Per chi arriva da VMware, è il punto in cui le abitudini "port group + VLAN" incontrano l'overlay OVN.

![Opzioni di rete per una VM: masquerade, UDN Layer2, bridge/localnet](/diagrams/10-virt-networking.svg)

## Le opzioni di collegamento

| Binding | Rete | Quando |
| --- | --- | --- |
| **masquerade** | pod network (NAT) | default, semplice, accesso a Service/DNS |
| **UDN Layer2 (primaria)** | overlay isolato | IP stabile + **live-migration**, multi-tenant |
| **bridge / localnet** | VLAN fisica | la VM deve stare su una LAN esistente |
| **SR-IOV** | VF hardware | performance line-rate |

## masquerade

La VM esce in NAT attraverso l'interfaccia del pod: `eth0` sulla pod network di default. Semplice e sempre funzionante, ideale quando alla VM basta uscire e raggiungere i Service.

## UDN Layer2 e live-migration

Per le VM la topologia **[UDN Layer2](/udn/topologie/)** primaria è spesso la scelta migliore: un segmento piatto dove l'IP della VM **resta stabile** e "segue" la VM durante la **live-migration** fra nodi, esattamente ciò che ci si aspetta da un ambiente virtualizzato. In più isola il tenant.

## bridge / localnet su VLAN

Quando la VM deve stare sulla **rete fisica** (integrazione con sistemi esterni sulla stessa VLAN), si usa un bridge sulla NIC configurato con [NMState](/fisiche/bridge-nmstate/) e una rete secondaria bridge o [localnet](/fisiche/localnet/). È l'equivalente diretto del "port group con VLAN" di vSphere.

## Migrazione da VMware — mappatura mentale

| VMware | OpenShift Virtualization |
| --- | --- |
| port group standard/distribuito | rete secondaria bridge/localnet + NMState |
| VLAN ID sul port group | `vlanID` nella NAD localnet |
| vMotion | live-migration (meglio con UDN Layer2) |
| rete VM di default | binding masquerade sulla pod network |

Il salto concettuale è che l'isolamento e l'IP stabile non richiedono più una VLAN dedicata: una UDN Layer2 li dà via software, self-service.
