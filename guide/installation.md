# Installation

AvelPress can be easily integrated into any WordPress plugin or theme. Follow this guide to get started.

## Requirements

Before installing AvelPress, make sure you have:

- **PHP 7.4+**
- **WordPress 5.0+**
- **Composer** (required)

## Installation Methods

### Method 1: AvelPress CLI (Recommended)

The easiest way to create a new AvelPress project is using the official CLI tool.


#### Install AvelPress CLI (Global or Local)

You can install the AvelPress CLI globally or locally:

**Global installation (recommended):**

```bash
composer global require avelpress/avelpress-cli
```

> **Note:** If you install globally, make sure your Composer global bin directory is in your system's `PATH` environment variable. Otherwise, the `avel` command will not be available in your terminal. You can check the Composer global bin path with:
> 
> ```bash
> composer global config bin-dir --absolute
> ```
> 
> Add this directory to your `PATH` if needed.

**Local installation (per project):**

```bash
composer require avelpress/avelpress-cli --dev
```

To run the CLI locally, use:

```bash
./vendor/bin/avel new <vendor>/<name>
```


#### Create a new plugin

```bash
avel new <vendor>/<name>
```

Or, if installed locally:

```bash
./vendor/bin/avel new <vendor>/<name>
```

Example:

```bash
avel new acme/my-awesome-plugin
# or
./vendor/bin/avel new acme/my-awesome-plugin
```

This will create a new directory `acme-my-awesome-plugin` with all the necessary files and structure.

> **Note:** Theme support (`--type=theme`) is currently in development. Please use the plugin type for now.

#### Install dependencies

After creating your project, navigate to the directory and install dependencies:

```bash
cd acme-my-awesome-plugin
composer install
```

### Method 2: Manual Composer Installation

If you prefer to set up manually:

```bash
composer require avelpress/avelpress
```

## Project Structure

When you create a new project with `avel new`, it will generate the following structure:

```
acme-my-awesome-plugin/
├── acme-my-awesome-plugin.php    # Main plugin file
├── composer.json
├── assets/
├── src/
│   ├── app/
│   │   ├── Controllers/
│   │   ├── Http/
│   │   ├── Models/
│   │   ├── Modules/
│   │   ├── Providers/
│   │   └── Services/
│   ├── bootstrap/
│   │   └── providers.php
│   ├── config/
│   │   └── app.php
│   ├── database/
│   │   └── migrations/
│   ├── resources/
│   │   └── views/
│   └── routes/
│       └── api.php
└── vendor/                      # Composer dependencies (after install)
```
## Next Steps

Now that AvelPress is installed, you can:

1. [Get Started](/guide/getting-started) with your first AvelPress application
2. Learn about [Application Structure](/guide/core/application-structure)
3. Create your first [Service Provider](/guide/core/service-providers)

## Troubleshooting

### Common Issues

**CLI command not found**

- Make sure Composer's global bin directory is in your PATH
- Verify the CLI was installed correctly: `composer global show avelpress/avelpress-cli`

**Project creation fails**

- Ensure you have write permissions in the current directory
- Check if the target directory already exists

**Composer install errors**

- Make sure you're in the correct project directory
- Verify your PHP version meets the requirements
- Check your internet connection for package downloads

**Plugin activation errors**

- Ensure PHP version is 7.4 or higher
- Check WordPress version compatibility
- Verify all Composer dependencies were installed correctly
