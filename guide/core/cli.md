# CLI Commands

AvelPress includes a powerful command-line interface (CLI) tool called `avel` that helps you quickly generate code, manage migrations, build distributions, and perform various development tasks. The CLI is built with Symfony Console and provides an intuitive way to scaffold your WordPress plugins and themes.

## Installation

### Prerequisites

- PHP 7.4 or higher
- Composer
- WordPress development environment

### Install from Source

```bash
# Clone the CLI repository
git clone https://github.com/avelpress/avelpress-cli.git
cd avelpress-cli

# Install dependencies
composer install

# Make the CLI globally available (optional)
# On Unix/Linux/macOS:
chmod +x bin/avel
sudo ln -s /path/to/avelpress-cli/bin/avel /usr/local/bin/avel

# On Windows, add the bin directory to your PATH environment variable
```

### Verify Installation

```bash
avel --version
```

## Available Commands

### Creating New Projects

#### `avel new`

Create a new WordPress plugin or theme with AvelPress structure:

```bash
# Create a new plugin (interactive prompts)
avel new acme/task-manager

# Create a theme
avel new acme/my-theme --type=theme
```

**Syntax:**
```bash
avel new <vendor>/<name> [--type=plugin|theme]
```

**Arguments:**
- `name` - Application name in format `vendor/package` (e.g., `acme/task-manager`)

**Options:**
- `--type=plugin|theme` - Application type (default: `plugin`)

**Interactive Prompts (for plugins):**
When creating a plugin, the CLI will prompt for:
- **Display Name** - Human-readable plugin name (max 80 characters)
- **Short Description** - Brief description for the plugin header (max 150 characters)

**Generated Structure:**
```
your-project/
├── your-project.php              # Main plugin/theme file
├── avelpress.config.php         # Build configuration
├── composer.json
├── .gitignore
├── assets/
├── src/
│   ├── app/
│   │   ├── Controllers/
│   │   ├── Http/
│   │   ├── Models/
│   │   ├── Modules/
│   │   ├── Providers/
│   │   │   └── AppServiceProvider.php
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
└── vendor/
```

**Examples:**
```bash
# Create a task management plugin
avel new acme/task-manager
# Prompts: "Task Manager Pro", "A comprehensive task management system"

# Create a custom theme
avel new acme/corporate-theme --type=theme
```

**Syntax:**
```bash
avel new <vendor>/<name> [--type=plugin|theme]
```

**Arguments:**
- `name` - Application name in format `vendor/package` (e.g., `acme/task-manager`)

**Options:**
- `--type=plugin|theme` - Application type (default: `plugin`)

**Interactive Prompts (for plugins):**
When creating a plugin, the CLI will prompt for:
- **Display Name** - Human-readable plugin name (max 80 characters)
- **Short Description** - Brief description for the plugin header (max 150 characters)

**Generated Structure:**
```
your-project/
├── your-project.php              # Main plugin/theme file
├── avelpress.config.php         # Build configuration
├── composer.json
├── .gitignore
├── assets/
├── src/
│   ├── app/
│   │   ├── Controllers/
│   │   ├── Http/
│   │   ├── Models/
│   │   ├── Modules/
│   │   ├── Providers/
│   │   │   └── AppServiceProvider.php
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
└── vendor/
```

**Examples:**
```bash
# Create a task management plugin
avel new acme/task-manager
# Prompts: "Task Manager Pro", "A comprehensive task management system"

# Create a custom theme
avel new acme/corporate-theme --type=theme
```

**Example output structure:**
```
my-awesome-plugin/
├── my-awesome-plugin.php
├── composer.json
├── .gitignore
├── README.md
├── src/
│   ├── Plugin.php
│   ├── Providers/
│   │   └── AppServiceProvider.php
│   └── Controllers/
│       └── MainController.php
├── database/
│   └── migrations/
├── resources/
│   ├── views/
│   └── assets/
└── config/
    └── app.php
```

### Code Generation

#### `avel make:controller`

Generate a new controller class:

```bash
# Basic controller
avel make:controller UserController

# Resource controller with CRUD methods
avel make:controller PostController --resource

# Controller in a specific module
avel make:controller UserController --module=Auth --resource
```

Generated controller example:
```php
<?php

namespace App\Http\Controllers;

use AvelPress\Routing\Controller;

defined( 'ABSPATH' ) || exit;

class UserController extends Controller {

	/**
	 * Display a listing of the resource.
	 */
	public function index() {
		//
	}

	/**
	 * Show the form for creating a new resource.
	 */
	public function create() {
		//
	}

	/**
	 * Store a newly created resource in storage.
	 */
	public function store($request) {
		//
	}

	/**
	 * Display the specified resource.
	 */
	public function show($request) {
		//
	}

	/**
	 * Show the form for editing the specified resource.
	 */
	public function edit($request) {
		//
	}

	/**
	 * Update the specified resource in storage.
	 */
	public function update($request) {
		//
	}

	/**
	 * Remove the specified resource from storage.
	 */
	public function destroy($request) {
		//
	}

}
```

#### `avel make:model`

Generate Eloquent model classes:

```bash
# Basic model
avel make:model User

# Model with fillable attributes and timestamps
avel make:model User --fillable=name,email,status --timestamps

# Model in a specific module
avel make:model User --module=Auth --fillable=name,email --timestamps

# Model with custom table name and prefix
avel make:model User --table=wp_custom_users --prefix=custom_ --fillable=name,email
```

Generated model example:
```php
<?php

namespace App\Models;

use AvelPress\Database\Eloquent\Model;

defined( 'ABSPATH' ) || exit;

class User extends Model {

	/**
	 * The table prefix for the model.
	 */
	protected $prefix = 'custom_';

	/**
	 * Indicates if the model should be timestamped.
	 */
	public $timestamps = true;

	/**
	 * The attributes that are mass assignable.
	 */
	protected $fillable = [
		'name',
		'email',
		'status',
	];

}
```

#### `avel make:migration`

Create database migration files:

```bash
# Create migration
avel make:migration create_users_table

# Create migration with table name
avel make:migration create_products_table --table=products

# Create migration for modifying table
avel make:migration add_email_to_users_table --table=users
```

Generated migration example:
```php
<?php

use AvelPress\Database\Migrations\Migration;
use AvelPress\Database\Schema\Blueprint;
use AvelPress\Database\Schema\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::drop('users');
    }
};
```

#### `avel make:request`

Generate form request classes:

```bash
# Basic request
avel make:request StoreUserRequest

# Request with validation rules
avel make:request UpdateProductRequest --rules
```

Generated request example:
```php
<?php

namespace App\Http\Requests;

use AvelPress\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The name field is required.',
            'email.required' => 'The email field is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email is already registered.',
            'password.required' => 'The password field is required.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }

    public function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower($this->email),
            'name' => ucwords($this->name),
        ]);
    }
}
```

#### `avel make:resource`

Generate JSON resource classes:

```bash
# Basic resource
avel make:resource UserResource

# Resource collection
avel make:resource UserResource --collection

# Resource with relationships
avel make:resource PostResource --relationships=user,comments
```

Generated resource example:
```php
<?php

namespace App\Http\Resources;

use AvelPress\Http\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
```

#### `avel make:provider`

Generate service provider classes:

```bash
# Basic provider
avel make:provider PaymentServiceProvider

# Provider with boot method
avel make:provider EventServiceProvider --boot
```

Generated provider example:
```php
<?php

namespace App\Providers;

use AvelPress\Support\ServiceProvider;

class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind('payment.gateway', function () {
            return new PaymentGateway();
        });
    }

    public function boot(): void
    {
        // Bootstrap services
    }
}
```

#### `avel make:middleware`

Generate middleware classes:

```bash
# Basic middleware
avel make:middleware AuthMiddleware

# Middleware with before/after hooks
avel make:middleware LoggingMiddleware --hooks
```

#### `avel make:command`

Generate custom Artisan commands:

```bash
# Basic command
avel make:command SendEmailsCommand

# Command with signature
avel make:command ImportUsersCommand --signature="import:users {file}"
```

### Database Commands

#### `avel migrate`

Run database migrations:

```bash
# Run all pending migrations
avel migrate

# Run migrations for specific path
avel migrate --path=database/migrations/2024

# Show migration status
avel migrate:status

# Rollback last migration
avel migrate:rollback

# Rollback specific number of migrations
avel migrate:rollback --step=3

# Reset all migrations
avel migrate:reset

# Refresh migrations (reset + migrate)
avel migrate:refresh

# Fresh migration (drop all + migrate)
avel migrate:fresh
```

#### `avel db:seed`

Run database seeders:

```bash
# Run all seeders
avel db:seed

# Run specific seeder
avel db:seed --class=UserSeeder

# Seed with fresh migration
avel migrate:fresh --seed
```

### Development Commands

#### `avel serve`

Start a development server:

```bash
# Start server on default port
avel serve

# Start on specific port
avel serve --port=8080

# Start with specific host
avel serve --host=0.0.0.0 --port=9000
```

#### `avel tinker`

Start an interactive PHP shell:

```bash
avel tinker
```

In the shell, you can interact with your models and application:
```php
>>> $user = App\Models\User::find(1)
>>> $user->name
=> "John Doe"
>>> $users = App\Models\User::where('status', 'active')->get()
>>> $users->count()
=> 42
```

#### `avel config:cache`

Cache configuration files for better performance:

```bash
# Cache config
avel config:cache

# Clear config cache
avel config:clear
```

#### `avel route:list`

Display all registered routes:

```bash
# List all routes
avel route:list

# Filter by method
avel route:list --method=GET

# Filter by name
avel route:list --name=user

# Show route middleware
avel route:list --middleware
```

### Plugin Management Commands

#### `avel plugin:install`

Install and activate plugins:

```bash
# Install from WordPress.org
avel plugin:install woocommerce

# Install specific version
avel plugin:install woocommerce --version=8.0.0

# Install from ZIP file
avel plugin:install /path/to/plugin.zip

# Install and activate
avel plugin:install woocommerce --activate
```

#### `avel plugin:activate`

Activate plugins:

```bash
# Activate single plugin
avel plugin:activate woocommerce

# Activate multiple plugins
avel plugin:activate woocommerce elementor

# Activate all plugins
avel plugin:activate --all
```

#### `avel plugin:deactivate`

Deactivate plugins:

```bash
# Deactivate single plugin
avel plugin:deactivate woocommerce

# Deactivate all plugins
avel plugin:deactivate --all
```

### Custom Commands

You can create custom commands for your specific needs:

```php
<?php

namespace App\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class ImportUsersCommand extends Command
{
    protected static $defaultName = 'import:users';
    protected static $defaultDescription = 'Import users from CSV file';

    protected function configure(): void
    {
        $this
            ->addArgument('file', InputArgument::REQUIRED, 'CSV file path')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Show what would be imported')
            ->addOption('skip-existing', null, InputOption::VALUE_NONE, 'Skip existing users');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $file = $input->getArgument('file');
        $dryRun = $input->getOption('dry-run');
        $skipExisting = $input->getOption('skip-existing');

        $output->writeln("<info>Importing users from: {$file}</info>");

        if ($dryRun) {
            $output->writeln("<comment>DRY RUN - No data will be imported</comment>");
        }

        // Import logic here...
        $imported = $this->importUsers($file, $dryRun, $skipExisting);

        $output->writeln("<success>Successfully imported {$imported} users</success>");

        return Command::SUCCESS;
    }

    private function importUsers(string $file, bool $dryRun, bool $skipExisting): int
    {
        // Implementation
        return 0;
    }
}
```

Register custom commands in your service provider:

```php
<?php

namespace App\Providers;

use AvelPress\Support\ServiceProvider;
use App\Commands\ImportUsersCommand;

class CommandServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                ImportUsersCommand::class,
            ]);
        }
    }
}
```

## Configuration

### Global Configuration

Create a global config file at `~/.avel/config.json`:

```json
{
    "defaults": {
        "author": "Your Name",
        "email": "your@email.com",
        "namespace": "YourCompany",
        "license": "GPL-2.0+"
    },
    "paths": {
        "stubs": "~/.avel/stubs"
    },
    "templates": {
        "plugin": "default",
        "theme": "default"
    }
}
```

### Project Configuration

Each project can have its own `.avel.json` config:

```json
{
    "namespace": "MyPlugin",
    "paths": {
        "controllers": "src/Controllers",
        "models": "src/Models",
        "migrations": "database/migrations",
        "requests": "src/Http/Requests",
        "resources": "src/Http/Resources"
    },
    "stubs": {
        "controller": "custom-controller.stub",
        "model": "custom-model.stub"
    }
}
```

## Stubs Customization

You can customize the code generation templates by publishing and modifying stubs:

```bash
# Publish stubs to project
avel stub:publish

# Publish specific stub
avel stub:publish --stub=controller

# Publish to custom location
avel stub:publish --path=resources/stubs
```

Example custom controller stub:
```php
<?php

namespace {{ namespace }};

use AvelPress\Routing\Controller;
use {{ namespacedRequests }}

class {{ class }} extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($request)
    {
        // TODO: Implement index method
        return response()->json([
            'message' => 'List {{ modelVariable }}s',
            'data' => []
        ]);
    }

    /**
     * Store a newly created resource.
     */
    public function store({{ storeRequest }} $request)
    {
        // TODO: Implement store method
        return response()->json([
            'message' => '{{ modelVariable }} created successfully'
        ], 201);
    }

    // More methods...
}
```

## Workflow Examples

### Creating a Complete CRUD Feature

```bash
# 1. Create model with migration
avel make:model Product --migration

# 2. Create controller with all CRUD methods
avel make:controller ProductController --resource

# 3. Create form requests for validation
avel make:request StoreProductRequest
avel make:request UpdateProductRequest

# 4. Create JSON resources for API responses
avel make:resource ProductResource
avel make:resource ProductCollection

# 5. Run migration
avel migrate

# 6. Add routes (manual step in routes file)
# 7. Test with tinker
avel tinker
```

### Setting Up a New Plugin

```bash
# 1. Create new plugin
avel new ecommerce-plugin --type=plugin

# 2. Navigate to plugin directory
cd ecommerce-plugin

# 3. Create main entities
avel make:model Product --migration --factory --seeder
avel make:model Category --migration
avel make:model Order --migration

# 4. Create controllers
avel make:controller Admin/ProductController --resource
avel make:controller Api/ProductController --api

# 5. Create service providers
avel make:provider EcommerceServiceProvider

# 6. Run migrations
avel migrate

# 7. Seed database
avel db:seed
```

### Build and Distribution

#### `avel build`

Build a production-ready distribution package of your application:

```bash
# Build from project root
avel build
```

**Requirements:**
- Must be run from the root directory of an AvelPress project
- Requires `avelpress.config.php` configuration file

**Build Process:**
1. **Validation** - Checks for required files and configuration
2. **Dependency Collection** - Gathers vendor packages specified in config
3. **Namespace Prefixing** - Adds prefixes to prevent conflicts
4. **Source Processing** - Copies and processes `src/` directory
5. **Vendor Processing** - Copies and prefixes vendor packages
6. **Asset Copying** - Includes `assets/` and other files
7. **Distribution Creation** - Generates folder and ZIP (if available)

**Configuration File (`avelpress.config.php`):**
```php
<?php

return [
    'build' => [
        'prefixer' => [
            'namespace_prefix' => 'YourVendor\\YourPackage\\',
            'packages' => [
                'avelpress/avelpress',
                // Add other vendor packages to include
            ]
        ]
    ]
];
```

**Build Output:**
```
dist/
├── your-project/              # Complete project folder
│   ├── your-project.php
│   ├── src/
│   ├── vendor/               # Processed vendor packages
│   ├── assets/
│   └── README.md
└── your-project.zip          # ZIP distribution (if ZIP extension available)
```

**Features:**
- **Namespace Prefixing** - Prevents conflicts with other plugins
- **Dependency Management** - Only includes specified packages
- **Automatic Processing** - Updates use statements and class references
- **ZIP Support** - Creates ZIP file if PHP ZIP extension is available
- **Production Ready** - Optimized for distribution

**ZIP Extension Support:**
The build command gracefully handles missing ZIP extension:
- Shows warning if ZIP extension is not available
- Provides installation instructions for different platforms
- Continues with folder creation without interruption

**Installation Instructions Shown:**
```bash
# Ubuntu/Debian
sudo apt-get install php-zip

# CentOS/RHEL
sudo yum install php-zip

# Windows
# Uncomment extension=zip in php.ini

# Docker
RUN docker-php-ext-install zip
```

## Best Practices

### Project Organization
- Use consistent naming conventions (PascalCase for classes, snake_case for files)
- Organize related functionality in modules
- Keep migrations descriptive and specific

### CLI Usage
- Always run commands from your project root
- Use `--resource` for controllers that need CRUD operations
- Include `--timestamps` for models that need audit trails
- Specify `--fillable` attributes explicitly for security

### Build and Distribution
- Test your build output before distribution
- Keep `avelpress.config.php` updated with required packages
- Use semantic versioning
- Include proper documentation

### Development Workflow

1. **Project Setup:**
   ```bash
   avel new vendor/project-name
   cd vendor-project-name
   composer install
   ```

2. **Generate Components:**
   ```bash
   avel make:migration create_items_table
   avel make:model Item --timestamps --fillable=name,description
   avel make:controller ItemController --resource
   ```

3. **Build for Distribution:**
   ```bash
   avel build
   ```

## Troubleshooting

### Common Issues

**Command not found:**
- Ensure the CLI is properly installed
- Check your PATH environment variable
- Verify file permissions on Unix systems

**Permission denied:**
- Check file/directory permissions
- Use `sudo` for global installations on Unix systems
- Run terminal as administrator on Windows

**Build failures:**
- Verify `avelpress.config.php` exists and is valid
- Check that all specified packages are installed
- Ensure you're running from project root

**Namespace conflicts:**
- Adjust namespace_prefix in build configuration
- Use more specific vendor/package names
- Check for existing class names

### Getting Help

```bash
# Show all available commands
avel list

# Get help for specific command
avel help make:controller
avel make:controller --help

# Show CLI version
avel --version
```

For more help and examples, visit the [AvelPress Documentation](https://docs.avelpress.com).

## Complete E-commerce Example

Here's a complete example of building an e-commerce plugin with AvelPress CLI:

```bash
# 1. Create new plugin
avel new ecommerce-plugin --type=plugin

# 2. Navigate to plugin directory
cd ecommerce-plugin

# 3. Create main entities
avel make:model Product --migration --factory --seeder
avel make:model Category --migration
avel make:model Order --migration

# 4. Create controllers
avel make:controller Admin/ProductController --resource
avel make:controller Api/ProductController --api

# 5. Create service providers
avel make:provider EcommerceServiceProvider

# 6. Run migrations
avel migrate

# 7. Seed database
avel db:seed

# 8. Build for distribution
avel build
```

The AvelPress CLI significantly speeds up development by automating repetitive tasks and ensuring consistent code structure across your WordPress projects.
