import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "AvelPress",
  description: "Laravel-inspired PHP Framework for WordPress Plugins & Themes",
  base: '/',

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/assets/avelpress.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'FAQ', link: '/faq' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Whats is AvelPress?', link: '/guide/introduction' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Application Structure', link: '/guide/core/application-structure' },
            { text: 'Service Providers', link: '/guide/core/service-providers' },
            { text: 'Dependency Injection', link: '/guide/core/dependency-injection' },
            { text: 'Facades', link: '/guide/core/facades' },
            { text: 'CLI Commands', link: '/guide/core/cli' }
          ]
        },
        {
          text: 'Routing',
          items: [
            { text: 'Basic Routing', link: '/guide/routing/basic' },
            { text: 'Controllers', link: '/guide/routing/controllers' },
          ]
        },
        {
          text: 'HTTP',
          items: [
            { text: 'Validation', link: '/guide/http/validation' },
            { text: 'Form Requests', link: '/guide/http/form-requests' },
            { text: 'JSON Resources', link: '/guide/http/json-resources' },
          ]
        },
        {
          text: 'ORM & Database',
          items: [
            { text: 'Getting Started', link: '/guide/models/getting-started' },
            { text: 'Mass Assignment', link: '/guide/models/mass-assignment' },
            { text: 'Querying', link: '/guide/models/querying' },
            { text: 'Creating & Updating', link: '/guide/models/creating-updating' },
            { text: 'Relationships', link: '/guide/models/relationships' },
            { text: 'Accessors & Mutators', link: '/guide/models/accessors-mutators' },
            { text: 'WordPress Integration', link: '/guide/models/wordpress-integration' }
          ]
        },
        {
          text: 'Database',
          items: [
            { text: 'Getting Started', link: '/guide/database/getting-started' },
            { text: 'Migrations', link: '/guide/database/migrations' },
            { text: 'Schema Builder', link: '/guide/database/schema' },
            { text: 'Eloquent Models', link: '/guide/database/eloquent' },
            { text: 'Relationships', link: '/guide/database/relationships' },
            { text: 'Collections', link: '/guide/database/collections' }
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/avelpress/avelpress' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present AvelPress'
    },

    search: {
      provider: 'local'
    }
  }
})
