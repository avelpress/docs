---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "AvelPress"
  text: "PHP Framework for WordPress Plugins & Themes"
  tagline: Laravel-inspired Architecture
  image:
    src: /assets/avelpress.png
    alt: AvelPress Logo
  actions:
    - theme: brand
      text: Whats is AvelPress?
      link: /guide/getting-started
    - theme: alt
      text: Quickstart
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/avelpress/avelpress

features:
  - title: Architecture
    icon: 🏗️
    details: Adopt a Laravel 12 inspired architecture for Routes, Controllers, Models, Eloquent and more.
  - title: Lightweight (137 KB)
    icon: ⚡
    details: No third-party dependencies or bloat. Its built from scratch for speed and simplicity.
  - title: Productivity
    icon: 🚀
    details: Accelerate wordpress plugin and theme development with reusable components.
  - title: Simplicity
    icon: 💡
    details: Designed to be easy to learn and use, even for developers new to frameworks.
  - title: ORM Manager
    icon: 🗄️
    details: Lightweight ORM inspired by Laravel Eloquent, internally uses $wpdb. Simplifies database operations with minimal complexity.
  - title: Build Production
    icon: 🛠️
    details: The "avel build" CLI command creates a production-ready .zip and automatically prefixes dependency namespaces to avoid conflicts.
  - title: AvelPress CLI
    icon: 💻
    details: Boost productivity with the "avel" CLI. Quickly generate models, migrations, controllers, and more with simple commands.
  - title: Extensible
    icon: 🧩
    details: Easily extend core functionality with custom modules, service providers, and event hooks.
---
