# Introduction

**AvelPress** is a modern, minimalistic PHP framework designed to revolutionize how you build WordPress plugins and themes. Inspired by Laravel 12, it brings professional structure, boosts your productivity, and integrates web development best practices into the WordPress ecosystem – all without external dependencies or bloat.

## Why AvelPress?

Tired of dealing with complexity and lack of structure in WordPress development? AvelPress is the solution you've been waiting for. It was created to:

- 🏗️ **Modernize Your Architecture:** Adopt a Laravel-inspired structure with routes, controllers, models, and a lightweight Eloquent-like ORM, ensuring organized and easily maintainable code.
- ⚡ **Ensure Lightness and Performance:** At just 137 KB and built from scratch, AvelPress has no third-party dependencies, guaranteeing maximum performance and a minimal footprint.
- 🚀 **Boost Your Productivity:** Reusable components, a powerful CLI, and code generation tools accelerate your workflow, allowing you to focus on business logic.
- 💡 **Simplify Development:** Even for those new to frameworks, AvelPress is easy to learn and use, making WordPress development more accessible and enjoyable.
- 🛡️ **Prevent Dependency Conflicts:** The `avel build` command generates a ready-to-distribute .zip package, automatically prefixing dependency namespaces to avoid conflicts with other plugins – a smart and lightweight solution focused on what truly matters for WordPress.

With AvelPress, you focus on creating amazing features, while the framework handles structure and best practices.

## What's Included?

AvelPress adapts the essence of Laravel's architecture for WordPress, offering the following essential components:

- **Database Layer:** Complete abstraction for database operations, simplifying queries and data manipulation.
- **Migrations:** Version control for your database schema, allowing you to evolve your structure safely.
- **Models:** Eloquent-style models for interacting with your WordPress data in an expressive way.
- **Controllers:** Clear separation of concerns to organize your business logic.
- **Service Providers:** Modular application bootstrapping, similar to Laravel.
- **Configurations:** Easy management of settings for different environments.
- **Routes:** Laravel-style routing for the WordPress REST API, defining endpoints cleanly.
- **Collections:** Expressive data manipulation tools, inspired by Laravel Collections.
- **Command Line Interface (CLI):** The `avel` CLI tool automates common development tasks, such as creating new projects (`avel new`), generating components (`avel make:controller`, `avel make:model`, `avel make:migration`), and creating production packages (`avel build`).

All these components are seamlessly integrated into the WordPress ecosystem, allowing you to build scalable and high-quality solutions with ease.

## Requirements

- PHP 7.4 or higher
- WordPress 5.0 or higher

## Next Steps

Ready to get started? Check out the [Installation](/guide/installation) guide to set up AvelPress in your WordPress plugin or theme.


