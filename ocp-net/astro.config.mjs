// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://openshift-networking.pages.dev',
  integrations: [
    starlight({
      title: 'OpenShift Networking',
      description:
        'Networking OpenShift 4.18 dalle fondamenta: concetti di rete, OVN-Kubernetes, servizi, Multus, UDN, localnet e sicurezza.',
      defaultLocale: 'root',
      locales: { root: { label: 'Italiano', lang: 'it' } },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/helloiamgio' },
      ],
      editLink: {
        baseUrl: 'https://github.com/helloiamgio/openshift-networking/edit/main/',
      },
      lastUpdated: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      sidebar: [
        {
          label: 'Reti da zero',
          items: [
            { label: 'OSI e TCP/IP', slug: 'reti/osi-tcpip' },
            { label: 'L2 vs L3', slug: 'reti/l2-l3' },
            { label: 'VLAN e trunking', slug: 'reti/vlan' },
            { label: 'Subnet e CIDR', slug: 'reti/subnet-cidr' },
            { label: 'Overlay e underlay', slug: 'reti/overlay-underlay' },
          ],
        },
        {
          label: 'OVN-Kubernetes',
          items: [
            { label: 'OVS e OVN', slug: 'ovn/ovs-ovn' },
            { label: 'Architettura e datapath', slug: 'ovn/architettura' },
          ],
        },
        {
          label: 'Fondamenti OCP',
          items: [
            { label: 'Introduzione', slug: 'fondamenti/introduzione' },
            { label: 'Il modello a piani', slug: 'fondamenti/modello-piani' },
            { label: 'Pod network (Layer3)', slug: 'fondamenti/pod-network' },
            { label: 'Pianificazione CIDR', slug: 'fondamenti/cidr' },
          ],
        },
        {
          label: 'Servizi e traffico',
          items: [
            { label: 'Service', slug: 'servizi/service' },
            { label: 'DNS interno', slug: 'servizi/dns' },
            { label: 'Route e Ingress', slug: 'servizi/route-ingress' },
            { label: 'LoadBalancer e MetalLB', slug: 'servizi/loadbalancer' },
            { label: 'Egress', slug: 'servizi/egress' },
          ],
        },
        {
          label: 'Multus (reti secondarie)',
          items: [
            { label: 'Cos\u2019\u00e8 Multus', slug: 'multus/introduzione' },
            { label: 'NetworkAttachmentDefinition', slug: 'multus/nad' },
            { label: 'Plugin e casi d\u2019uso', slug: 'multus/plugin' },
          ],
        },
        {
          label: 'UDN (reti primarie)',
          items: [
            { label: 'Cos\u2019\u00e8 una UDN', slug: 'udn/introduzione' },
            { label: 'Layer2 vs Layer3', slug: 'udn/topologie' },
            { label: 'UDN vs CUDN', slug: 'udn/udn-cudn' },
          ],
        },
        {
          label: 'Reti fisiche e localnet',
          items: [
            { label: 'localnet: pod/VM su VLAN', slug: 'fisiche/localnet' },
            { label: 'Bridge e NMState', slug: 'fisiche/bridge-nmstate' },
            { label: 'SR-IOV', slug: 'fisiche/sriov' },
          ],
        },
        {
          label: 'Sicurezza di rete',
          items: [
            { label: 'NetworkPolicy', slug: 'sicurezza/networkpolicy' },
            { label: 'AdminNetworkPolicy', slug: 'sicurezza/adminnetworkpolicy' },
            { label: 'UDN + micro-segmentazione', slug: 'sicurezza/udn-microseg' },
          ],
        },
        {
          label: 'OpenShift Virtualization',
          items: [{ label: 'Networking delle VM', slug: 'virt/networking' }],
        },
        {
          label: 'Multus o UDN?',
          items: [{ label: 'Confronto e scelta', slug: 'confronto' }],
        },
        {
          label: 'Pratica',
          items: [
            { label: 'Runbook: UDN Layer3', slug: 'pratica/runbook-udn' },
            { label: 'Test di isolamento', slug: 'pratica/test-isolamento' },
            { label: 'Lab: NetworkPolicy', slug: 'pratica/lab-networkpolicy' },
            { label: 'Lab: localnet', slug: 'pratica/lab-localnet' },
          ],
        },
      ],
    }),
  ],
});
