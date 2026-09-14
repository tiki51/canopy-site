import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://tiki51.github.io/canopy-site',
  base: '/canopy-site',
  integrations: [starlight({
    title: 'Canopy',
    logo: {
      src: './src/assets/canopy-icon-192.png',
      alt: '',
      replacesTitle: false,
    },
    favicon: '/images/canopy-icon-32.png',
    customCss: ['./src/styles/starlight.css'],
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/tiki51/canopy' }],
    sidebar: [
      { label: 'Start here', items: [{ label: 'Overview', link: '/docs/' }, { label: 'Getting started with Claude Code', link: '/getting-started/claude-code/' }, { label: 'Getting started with OpenCode', link: '/getting-started/opencode/' }] },
      { label: 'Core concepts', items: [{ label: 'Channels', link: '/docs/channels/' }, { label: 'Agents', link: '/docs/agents/' }, { label: 'Workflows', link: '/docs/workflows/' }] },
      { label: 'Set up Canopy', items: [{ label: 'Settings & security', link: '/docs/settings/' }, { label: 'Repositories', link: '/docs/repositories/' }] },
      { label: 'Collaborate over time', items: [{ label: 'Documents, DMs & schedules', link: '/docs/context/' }, { label: 'Memory', link: '/docs/memory/' }] },
      { label: 'Costs & control', items: [{ label: 'Costs and limits', link: '/docs/costs/' }] },
      { label: 'Reference', items: [{ label: 'Tools and environment', link: '/docs/reference/' }] },
      { label: 'Troubleshooting', items: [{ label: 'Fix common problems', link: '/docs/troubleshooting/' }] },
    ],
  })]
});
