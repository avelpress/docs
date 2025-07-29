# Getting Started

This guide will walk you through creating your first AvelPress application. We'll build a simple plugin that demonstrates the core concepts of the framework using the AvelPress CLI.


## Installing the AvelPress CLI

To install the AvelPress CLI, follow the official installation instructions in the [Installation Guide](/guide/installation.md). The recommended method is using Composer:

```bash
composer global require avelpress/avelpress-cli
```

This ensures you always get the latest stable version and all dependencies are managed automatically.

## Available CLI Commands

The AvelPress CLI provides the following commands:

- `avel new` - Create a new AvelPress application (plugin or theme)
- `avel make:controller` - Generate a new controller
- `avel make:model` - Generate a new model
- `avel make:migration` - Generate a new database migration
- `avel build` - Build a distribution package of your application

## Testing Your Plugin

### 1. Activate the Plugin

1. Upload your plugin to `/wp-content/plugins/`
2. Activate it in the WordPress admin

### 2. Test API Endpoints

You can also create a theme instead:
```bash
avel new acme/my-theme --type=theme
```

After creation, navigate to your project and install dependencies:
```bash
cd acme-task-manager
composer install
```

This will generate the following structure:

```
acme-task-manager/
├── acme-task-manager.php           # Main plugin file
├── avelpress.config.php           # Build configuration
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
└── vendor/                        # Composer dependencies
```

### 2. Understanding the Generated Files

The CLI has created the basic structure with several important files:

#### Configuration (`avelpress.config.php`)

```php
<?php

return [
	'plugin_id' => 'acme-task-manager',
	'build' => [
		'output_dir' => 'dist',
		'composer_cleanup' => true,
		'prefixer' => [
			'namespace_prefix' => 'Acme\\TaskManager\\'
		]
	]
];
```

This configuration file is used by the `avel build` command to:
- Add namespace prefixes to vendor packages to prevent conflicts
- Specify which vendor packages to include in the build
- Configure the build process for distribution

#### Main Plugin File (`acme-task-manager.php`)

```php
<?php
/**
 * Plugin Name: Task Manager Pro
 * Description: A comprehensive task management system for WordPress with advanced features.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Your Name
 * Text Domain: acme-task-manager
 * License: GPLv2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

use AvelPress\AvelPress;

defined( 'ABSPATH' ) || exit;

define( 'ACME_TASK_MANAGER_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );

require ACME_TASK_MANAGER_PLUGIN_PATH . 'vendor/autoload.php';

AvelPress::init( 'acme-task-manager', [
	'base_path' => ACME_TASK_MANAGER_PLUGIN_PATH . 'src',
] );
```

Notice how the CLI uses the display name and description you provided during project creation.

#### Configuration (`src/config/app.php`)

```php
<?php

defined( 'ABSPATH' ) || exit;

return [
	'name' => 'Acme-task-manager',
	'version' => '1.0.0',
	'debug' => defined('WP_DEBUG') ? WP_DEBUG : false,
];
```

#### Service Providers (`src/bootstrap/providers.php`)

```php
<?php

defined( 'ABSPATH' ) || exit;

return [
	Acme\TaskManager\App\Providers\AppServiceProvider::class,
];
```

#### AppServiceProvider (`src/app/Providers/AppServiceProvider.php`)

```php
<?php

namespace Acme\TaskManager\App\Providers;

use AvelPress\Support\ServiceProvider;

defined( 'ABSPATH' ) || exit;

class AppServiceProvider extends ServiceProvider {
	/**
	 * Register any application services.
	 */
	public function register(): void {
		//
	}

	/**
	 * Bootstrap any application services.
	 */
	public function boot(): void {
		//
	}
}
```

### 3. Building the Task Manager

Now let's add the functionality to create a task management system using the CLI generators.

#### Database Migration

Use the AvelPress CLI to create a migration:

```bash
avel make:migration create_tasks_table
```

**Advanced Migration Options:**
```bash
# Create migration in a specific module
avel make:migration create_tasks_table --module=TaskManager

# Create migration with app-id prefix for table names
avel make:migration create_tasks_table --app-id=tm

# Create migration in custom path
avel make:migration create_tasks_table --path=custom/path/migrations
```

This will create a migration file in `src/database/migrations/` with a timestamp prefix (e.g., `2024_07_22_143052_create_tasks_table.php`).

The generated file will look like this:

```php
<?php

use AvelPress\Database\Migrations\Migration;
use AvelPress\Database\Schema\Blueprint;
use AvelPress\Database\Schema\Schema;

defined( 'ABSPATH' ) || exit;

return new class extends Migration {
	/**
	 * Run the migrations.
	 */
	public function up(): void {
		Schema::create( 'tasks', function (Blueprint $table) {
			// Add columns to the table
		} );
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void {
		Schema::drop( 'tasks' );
	}
};
```

Now update the `up()` method to define your table structure:

```php
public function up(): void {
	Schema::create( 'tasks', function (Blueprint $table) {
		$table->id();
		$table->string('title');
		$table->text('description')->nullable();
		$table->boolean('completed')->default(false);
		$table->timestamps();
	} );
}
```

> **Tip:** The CLI automatically detects table names from migration names. Use patterns like:
>
> - `create_tasks_table` - Creates a new table
> - `add_column_to_tasks_table` - Modifies existing table
> - Use `--app-id=your-app` to prefix table names automatically

> **Note:** When using the `timestamps()` method, the columns `created_at` and `updated_at` will be automatically created in the table to record the creation and update dates of each record.

#### Model

Use the AvelPress CLI to create a model:

```bash
avel make:model Task --timestamps
```

**Advanced Model Options:**
```bash
# Create model with fillable attributes
avel make:model Task --fillable=title,description,completed --timestamps

# Create model in a specific module
avel make:model Task --module=TaskManager --timestamps

# Create model with custom table name
avel make:model Task --table=custom_tasks --timestamps

# Create model with table prefix
avel make:model Task --prefix=tm_ --timestamps

# Create model in custom path
avel make:model Task --path=src/app/Custom/Models --timestamps
```

This will create `src/app/Models/Task.php`:

```php
<?php

namespace Acme\TaskManager\App\Models;

use AvelPress\Database\Eloquent\Model;

defined( 'ABSPATH' ) || exit;

class Task extends Model {

	/**
	 * The attributes that are mass assignable.
	 */
	protected $fillable = [
		'title',
		'description', 
		'completed'
	];

	/**
	 * Indicates if the model should be timestamped.
	 */
	public $timestamps = true;

}
```

The CLI automatically:
- Creates the model with proper namespace based on your project structure
- Sets up fillable attributes if provided via `--fillable` option
- Enables timestamps if `--timestamps` flag is used
- Uses proper WordPress coding standards
- Detects and applies the correct namespace from your project configuration

> **Note:** By default, AvelPress (like Laravel) expects the table name to follow naming conventions. In this example, our `Task` model expects a table named `tasks`. The difference is that AvelPress automatically detects and applies the WordPress table prefix (e.g., `wp_tasks` if your prefix is `wp_`), so you don't need to make any manual adjustments regardless of what prefix your WordPress installation uses.

- [See More About Models](/guide/models/eloquent.md)

#### Controller

Use the AvelPress CLI to create a controller:

```bash
avel make:controller TaskController --resource
```

**Advanced Controller Options:**
```bash
# Create controller in a specific module
avel make:controller TaskController --module=TaskManager --resource

# Create controller in custom path
avel make:controller TaskController --path=src/app/Custom/Controllers --resource

# Create simple controller without resource methods
avel make:controller TaskController

# Create API controller in a module
avel make:controller Api/TaskController --module=TaskManager --resource
```

This will create `src/app/Http/Controllers/TaskController.php` with all CRUD methods:

```php
<?php

namespace Acme\TaskManager\App\Http\Controllers;

use AvelPress\Routing\Controller;

defined( 'ABSPATH' ) || exit;

class TaskController extends Controller {

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

Now you can implement the business logic for each method. For example:

```php
public function index() {
	$tasks = Task::all();
	return JsonResource::collection($tasks);
}

public function store($request) {
	$task = Task::create([
		'title' => $request->get_param('title'),
		'description' => $request->get_param('description'),
		'completed' => false
	]);
	
	return new JsonResource($task);
}

public function show($request) {
	$id = $request->get_param('id');
	$task = Task::find($id);
	
	if (!$task) {
		return new \WP_Error('task_not_found', 'Task not found', ['status' => 404]);
	}
	
	return new JsonResource($task);
}

public function update($request) {
	$id = $request->get_param('id');
	$task = Task::find($id);
	
	if (!$task) {
		return new \WP_Error('task_not_found', 'Task not found', ['status' => 404]);
	}
	
	$task->update([
		'title' => $request->get_param('title') ?: $task->title,
		'description' => $request->get_param('description') ?: $task->description,
		'completed' => $request->get_param('completed') ?? $task->completed
	]);
	
	return new JsonResource($task);
}

public function destroy($request) {
	$id = $request->get_param('id');
	$task = Task::find($id);
	
	if (!$task) {
		return new \WP_Error('task_not_found', 'Task not found', ['status' => 404]);
	}
	
	$task->delete();
	
	return ['message' => 'Task deleted successfully'];
}
```

The CLI automatically:
- Creates the controller with proper namespace based on your project structure
- Includes all CRUD methods when using `--resource` flag
- Uses proper WordPress coding standards
- Places the controller in the correct directory structure
- Supports modular architecture when `--module` option is used
- Automatically detects and applies the correct namespace from your project configuration

#### Routes

Update `src/routes/api.php`:

```php
<?php

use Acme\TaskManager\App\Controllers\TaskController;
use AvelPress\Facades\Route;

defined('ABSPATH') || exit;

Route::prefix('task-manager/v1')->guards(['edit_posts'])->group(function () {
	Route::get('/tasks', [TaskController::class, 'index']);
	Route::post('/tasks', [TaskController::class, 'store']);
	Route::get('/tasks/{id}', [TaskController::class, 'show']);
	Route::put('/tasks/{id}', [TaskController::class, 'update']);
	Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
});
```

## Building and Distributing Your Plugin

AvelPress CLI provides a powerful build system that creates production-ready distributions of your plugin.

### Build Configuration

The `avelpress.config.php` file controls how your plugin is built:

```php
<?php

return [
	'build' => [
		'prefixer' => [
			'namespace_prefix' => 'Acme\\TaskManager\\',
			'packages' => [
				'avelpress/avelpress',
				// Add other vendor packages you want to include
			]
		]
	]
];
```

### Building Your Plugin

To create a distribution package:

```bash
avel build
```

This command will:

1. **Check Requirements**: Verify that all necessary files and configurations are present
2. **Collect Dependencies**: Gather all vendor packages specified in the configuration
3. **Namespace Prefixing**: Add namespace prefixes to prevent conflicts with other plugins
4. **Process Source Code**: Copy and process your `src/` directory, updating use statements for vendor packages
5. **Process Vendor Packages**: Copy and prefix vendor package namespaces
6. **Copy Assets**: Include your `assets/` directory and other necessary files
7. **Create Distribution**: Generate both a folder and ZIP file in the `dist/` directory

**Build Output:**
```
Building distribution package for: acme-task-manager
Using namespace prefix: Acme\TaskManager
Created directory: dist/
Created directory: dist/acme-task-manager/
Copied and processed: src/
Copied and processed vendor package: avelpress/avelpress
Copied and processed Composer autoload files
Copied: assets/
Copied and processed: acme-task-manager.php
Copied: README.md
Created: acme-task-manager.zip

Build completed successfully!
Distribution files created in: dist/
- Folder: dist/acme-task-manager/
- ZIP: dist/acme-task-manager.zip
```

### Build Features

#### Namespace Prefixing
The build system automatically prefixes namespaces to prevent conflicts:
- **Vendor packages**: All specified packages get prefixed namespaces
- **Source code**: Use statements for vendor packages are updated
- **Autoload files**: Composer autoload files are processed and updated

#### Automatic File Processing
- **PHP files**: Namespace and use statement processing
- **Non-PHP files**: Copied directly without modification
- **Main plugin file**: Use statements updated for vendor packages
- **Composer autoload**: All autoload files processed and updated

#### ZIP Extension Support
The build command includes automatic ZIP extension detection:
- If ZIP extension is available: Creates both folder and ZIP file
- If ZIP extension is missing: Shows installation instructions but continues with folder creation
- No build interruption due to missing ZIP extension

**ZIP Extension Installation:**
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

You can now test your API endpoints:

```bash
# Get all tasks
curl -X GET "https://yoursite.com/wp-json/task-manager/v1/tasks"

# Create a task
curl -X POST "https://yoursite.com/wp-json/task-manager/v1/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Task", "description": "This is a test task"}'

# Get a specific task
curl -X GET "https://yoursite.com/wp-json/task-manager/v1/tasks/1"

# Update a task
curl -X PUT "https://yoursite.com/wp-json/task-manager/v1/tasks/1" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete a task
curl -X DELETE "https://yoursite.com/wp-json/task-manager/v1/tasks/1"
```

## CLI Command Reference

### `avel new`

Create a new AvelPress application (plugin or theme).

**Syntax:**
```bash
avel new <vendor>/<name> [--type=plugin|theme]
```

**Options:**
- `--type` - Application type: `plugin` (default) or `theme`

**Interactive Prompts (for plugins):**
- Display name (max 80 characters)
- Short description (max 150 characters)

**Examples:**
```bash
# Create a plugin
avel new acme/task-manager

# Create a theme
avel new acme/my-theme --type=theme
```

### `avel make:controller`

Generate a new controller.

**Syntax:**
```bash
avel make:controller <name> [options]
```

**Options:**
- `--resource` - Generate resource controller with CRUD methods
- `--module=<name>` - Create controller in specific module
- `--path=<path>` - Custom controller path (default: `src/app/Http/Controllers`)

**Examples:**
```bash
# Basic controller
avel make:controller TaskController

# Resource controller with CRUD methods
avel make:controller TaskController --resource

# Controller in module
avel make:controller TaskController --module=TaskManager --resource

# Controller in custom path
avel make:controller Api/TaskController --path=src/app/Api/Controllers
```

### `avel make:model`

Generate a new model.

**Syntax:**
```bash
avel make:model <name> [options]
```

**Options:**
- `--timestamps` - Enable timestamps for the model
- `--fillable=<list>` - Comma-separated list of fillable attributes
- `--table=<name>` - Custom table name
- `--prefix=<prefix>` - Table prefix
- `--module=<name>` - Create model in specific module
- `--path=<path>` - Custom model path (default: `src/app/Models`)

**Examples:**
```bash
# Basic model
avel make:model Task

# Model with timestamps and fillable attributes
avel make:model Task --timestamps --fillable=title,description,completed

# Model in module
avel make:model Task --module=TaskManager --timestamps

# Model with custom table
avel make:model Task --table=custom_tasks --prefix=tm_
```

### `avel make:migration`

Generate a new database migration.

**Syntax:**
```bash
avel make:migration <name> [options]
```

**Options:**
- `--module=<name>` - Create migration in specific module
- `--app-id=<id>` - App ID prefix for table names
- `--path=<path>` - Custom migration path (default: `src/database/migrations`)

**Examples:**
```bash
# Basic migration
avel make:migration create_tasks_table

# Migration in module
avel make:migration create_tasks_table --module=TaskManager

# Migration with app-id prefix
avel make:migration create_tasks_table --app-id=tm
```

### `avel build`

Build a distribution package of your application.

**Syntax:**
```bash
avel build
```

**Requirements:**
- Must be run from the root of an AvelPress project
- Requires `avelpress.config.php` configuration file

**Features:**
- Namespace prefixing for vendor packages
- Automatic dependency processing
- ZIP file creation (if ZIP extension available)
- Production-ready distribution package

**Configuration:**
The build process is controlled by `avelpress.config.php`:

```php
<?php
return [
	'build' => [
		'prefixer' => [
			'namespace_prefix' => 'YourVendor\\YourPackage\\',
			'packages' => [
				'avelpress/avelpress',
				// Other vendor packages
			]
		]
	]
];
```

## What's Next?

Congratulations! You've created your first AvelPress plugin and learned how to use the CLI tools. Here's what you can explore next:

- [Application Structure](/guide/core/application-structure) - Understand how AvelPress organizes code
- [Service Providers](/guide/core/service-providers) - Learn about dependency injection and service containers
- [Database Relationships](/guide/database/relationships) - Add relationships between models
- [JSON Resources](/guide/http/json-resources) - Customize API responses
- [Validation](/guide/http/validation) - Add request validation
- [CLI Reference](/guide/core/cli) - Complete CLI command documentation

## Key Concepts Learned

In this tutorial, you learned:

- **CLI Usage** - How to use the AvelPress CLI to scaffold applications
- **Project Structure** - Understanding the generated directory structure
- **Application Initialization** - How to bootstrap AvelPress
- **Service Providers** - How to organize and register services
- **Migrations** - How to manage database schema changes with CLI generators
- **Models** - How to create models with various options using CLI
- **Controllers** - How to generate controllers with CRUD methods
- **Routing** - How to define API endpoints
- **Build System** - How to create production-ready distributions
- **Namespace Prefixing** - How the build system prevents conflicts

## Best Practices

### Project Organization
- Use modules for complex applications (`--module` option)
- Follow consistent naming conventions
- Keep related functionality together

### CLI Usage
- Use `--resource` flag for CRUD controllers
- Include `--timestamps` for models that need audit trails
- Use `--fillable` to explicitly define mass-assignable attributes
- Use `--app-id` for table prefixing in migrations

### Build and Distribution
- Always test your build output before distribution
- Keep your `avelpress.config.php` updated with required packages
- Use semantic versioning for your releases
- Include proper documentation in your distribution package
