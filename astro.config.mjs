import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const site = 'https://tiki51.github.io/canopy-site';
const ogImage = `${site}/og-card.png`;

export default defineConfig({
  site,
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
    components: {
      Head: './src/components/starlight/Head.astro',
      ThemeProvider: './src/components/starlight/ThemeProvider.astro',
    },
    head: [
      { tag: 'meta', attrs: { property: 'og:image', content: ogImage } },
      { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
      { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
      { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Canopy: your coding agents, working as a team.' } },
      { tag: 'meta', attrs: { name: 'twitter:image', content: ogImage } },
      { tag: 'meta', attrs: { name: 'theme-color', content: '#0a1730' } },
    ],
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/tiki51/canopy' }],
    sidebar: [
      { label: 'Start here', items: [{ label: 'Overview', link: '/docs/' }, { label: 'Getting started with Claude Code', link: '/getting-started/claude-code/' }, { label: 'Getting started with OpenCode', link: '/getting-started/opencode/' }, { label: 'Try the demo', link: '/docs/try-the-demo/' }] },
      { label: 'Core concepts', items: [{ label: 'Channels', link: '/docs/channels/' }, { label: 'Agents', link: '/docs/agents/' }, { label: 'Workflows', link: '/docs/workflows/' }] },
      { label: 'Set up Canopy', items: [{ label: 'Settings & security', link: '/docs/settings/' }, { label: 'Repositories', link: '/docs/repositories/' }] },
      { label: 'Collaborate over time', items: [{ label: 'Documents, DMs & schedules', link: '/docs/context/' }, { label: 'Memory', link: '/docs/memory/' }] },
      { label: 'Costs & control', items: [{ label: 'Costs and limits', link: '/docs/costs/' }] },
      { label: 'Reference', items: [{ label: 'Tools and environment', link: '/docs/reference/' }, { label: 'FAQ', link: '/docs/faq/' }] },
      { label: 'Troubleshooting', items: [{ label: 'Fix common problems', link: '/docs/troubleshooting/' }] },
    ],
  })]
});
