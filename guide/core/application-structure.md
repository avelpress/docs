# Application Structure

AvelPress follows a well-organized directory structure that promotes separation of concerns and maintainability. This guide explains the recommended project structure and how to organize your WordPress plugins and themes using AvelPress.

## Default Directory Structure

When you create a new AvelPress project using the CLI, the following structure is generated:

```
my-awesome-plugin/
├── my-awesome-plugin.php          # Main plugin file
├── composer.json                  # Composer dependencies
├── .gitignore                     # Git ignore rules
├── README.md                      # Project documentation
├── src/                          # Source code directory
│   ├── bootstrap/                # Application bootstrap
│   │   └── providers.php         # Service provider registration
│   ├── config/                   # Configuration files
│   │   └── app.php               # Application configuration
│   ├── app/                      # Application logic
│   │   ├── Controllers/          # HTTP controllers
│   │   ├── Models/               # Eloquent models
│   │   ├── Http/                 # HTTP layer
│   │   │   ├── Requests/         # Form request classes
│   │   │   └── Resources/        # JSON resource classes
│   │   ├── Services/             # Business logic services
│   │   ├── Providers/            # Service providers
│   │   ├── Modules/              # Feature modules
│   │   └── Helpers/              # Helper functions
│   ├── database/                 # Database related files
│   │   ├── migrations/           # Database migrations
│   │   ├── seeders/              # Database seeders
│   │   └── factories/            # Model factories
│   ├── routes/                   # Route definitions
│   │   ├── api.php               # API routes
│   │   ├── web.php               # Web routes
│   │   └── admin.php             # Admin routes
│   ├── resources/                # Resources and assets
│   │   ├── views/                # Template files
│   │   ├── assets/               # Raw assets
│   │   │   ├── js/               # JavaScript files
│   │   │   ├── css/              # CSS files
│   │   │   └── images/           # Image files
│   │   └── lang/                 # Language files
├── assets/                       # Compiled assets
│   ├── js/                       # Compiled JavaScript
│   ├── css/                      # Compiled CSS
│   └── images/                   # Optimized images
└── vendor/                       # Composer dependencies
```

## Core Directories

### src/app/

The `app` directory contains the core application logic:

#### Controllers
HTTP controllers handle requests and return responses:

```php
<?php
// src/app/Controllers/ProductController.php

namespace App\Controllers;

use AvelPress\Routing\Controller;
use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Resources\ProductResource;

class ProductController extends Controller
{
    public function index($request)
    {
        $products = Product::paginate(15);
        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request)
    {
        $product = Product::create($request->validated());
        return new ProductResource($product);
    }
}
```

#### Models
Eloquent models represent your data and business logic:

```php
<?php
// src/app/Models/Product.php

namespace App\Models;

use AvelPress\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';
    
    protected $fillable = [
        'name', 'description', 'price', 'sku'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orders()
    {
        return $this->belongsToMany(Order::class);
    }
}
```

#### Services
Services contain your business logic:

```php
<?php
// src/app/Services/ProductService.php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;

class ProductService
{
    public function createProductWithCategory(array $productData, int $categoryId): Product
    {
        $category = Category::findOrFail($categoryId);
        
        $product = Product::create($productData);
        $product->category()->associate($category);
        $product->save();

        $this->clearProductCache();
        
        return $product;
    }

    public function getPopularProducts(int $limit = 10): Collection
    {
        return Product::withCount('orders')
            ->orderBy('orders_count', 'desc')
            ->limit($limit)
            ->get();
    }

    private function clearProductCache(): void
    {
        wp_cache_delete('popular_products', 'my_plugin');
    }
}
```

#### Providers
Service providers bootstrap your application services:

```php
<?php
// src/app/Providers/AppServiceProvider.php

namespace App\Providers;

use AvelPress\Support\ServiceProvider;
use App\Services\ProductService;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ProductService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/../../database/migrations');
        $this->loadRoutesFrom(__DIR__ . '/../../routes/api.php');
    }
}
```

### src/bootstrap/

Contains application bootstrap files:

```php
<?php
// src/bootstrap/providers.php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\RouteServiceProvider::class,
    App\Providers\DatabaseServiceProvider::class,
];
```

### src/config/

Configuration files for your application:

```php
<?php
// src/config/app.php

return [
    'name' => 'My Awesome Plugin',
    'version' => '1.0.0',
    
    'cache' => [
        'default_ttl' => 3600,
        'prefix' => 'my_plugin_',
    ],
    
    'api' => [
        'version' => 'v1',
        'rate_limit' => 100,
    ],
];
```

### src/database/

Database-related files:

```php
<?php
// src/database/migrations/2024_01_01_create_products_table.php

use AvelPress\Database\Migrations\Migration;
use AvelPress\Database\Schema\Blueprint;
use AvelPress\Database\Schema\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('sku')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::drop('products');
    }
};
```

### src/routes/

Route definition files:

```php
<?php
// src/routes/api.php

use App\Controllers\ProductController;
use AvelPress\Facades\Route;

Route::prefix('my-plugin/v1')->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
});
```

## Modular Architecture

For larger applications, you can organize code into modules:

```
src/app/Modules/
├── Product/
│   ├── Controllers/
│   │   ├── ProductController.php
│   │   └── CategoryController.php
│   ├── Models/
│   │   ├── Product.php
│   │   └── Category.php
│   ├── Services/
│   │   └── ProductService.php
│   ├── Http/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Providers/
│   │   └── ProductServiceProvider.php
│   ├── database/
│   │   └── migrations/
│   └── routes/
│       └── api.php
├── Order/
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   └── ...
└── User/
    ├── Controllers/
    ├── Models/
    ├── Services/
    └── ...
```

### Module Service Provider

```php
<?php
// src/app/Modules/Product/Providers/ProductServiceProvider.php

namespace App\Modules\Product\Providers;

use AvelPress\Support\ServiceProvider;
use App\Modules\Product\Services\ProductService;

class ProductServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ProductService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        $this->loadRoutesFrom(__DIR__ . '/../routes/api.php');
    }
}
```

## WordPress Integration Structure

### Admin Integration

```
src/app/Admin/
├── Pages/
│   ├── DashboardPage.php
│   ├── SettingsPage.php
│   └── ProductsPage.php
├── MetaBoxes/
│   ├── ProductMetaBox.php
│   └── CategoryMetaBox.php
├── Widgets/
│   ├── StatsWidget.php
│   └── RecentProductsWidget.php
└── Assets/
    ├── AdminAssets.php
    └── EditorAssets.php
```

### Frontend Integration

```
src/app/Frontend/
├── Shortcodes/
│   ├── ProductListShortcode.php
│   └── ProductFormShortcode.php
├── Widgets/
│   ├── FeaturedProductsWidget.php
│   └── CategoryWidget.php
├── Templates/
│   ├── TemplateLoader.php
│   └── ProductTemplate.php
└── Assets/
    └── FrontendAssets.php
```

### WordPress Hooks Organization

```php
<?php
// src/app/WordPress/Hooks/ProductHooks.php

namespace App\WordPress\Hooks;

use App\Services\ProductService;

class ProductHooks
{
    private $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function register(): void
    {
        add_action('init', [$this, 'registerPostTypes']);
        add_action('save_post', [$this, 'saveProductData']);
        add_filter('the_content', [$this, 'enhanceProductContent']);
    }

    public function registerPostTypes(): void
    {
        register_post_type('product', [
            'public' => true,
            'has_archive' => true,
            'supports' => ['title', 'editor', 'thumbnail'],
            'show_in_rest' => true,
        ]);
    }

    public function saveProductData($postId): void
    {
        if (get_post_type($postId) === 'product') {
            $this->productService->syncWordPressPost($postId);
        }
    }

    public function enhanceProductContent($content): string
    {
        if (is_singular('product')) {
            $product = $this->productService->getByPostId(get_the_ID());
            if ($product) {
                $content .= $this->renderProductInfo($product);
            }
        }
        return $content;
    }

    private function renderProductInfo($product): string
    {
        ob_start();
        include plugin_dir_path(__FILE__) . '../../../resources/views/product-info.php';
        return ob_get_clean();
    }
}
```

## Configuration Management

### Environment-Based Configuration

```php
<?php
// src/config/app.php

$environment = wp_get_environment_type();

$baseConfig = [
    'name' => 'My Plugin',
    'version' => '1.0.0',
];

$environmentConfig = match($environment) {
    'development' => [
        'debug' => true,
        'cache_enabled' => false,
        'log_level' => 'debug',
    ],
    'staging' => [
        'debug' => true,
        'cache_enabled' => true,
        'log_level' => 'info',
    ],
    'production' => [
        'debug' => false,
        'cache_enabled' => true,
        'log_level' => 'error',
    ],
    default => [
        'debug' => false,
        'cache_enabled' => true,
        'log_level' => 'warning',
    ]
};

return array_merge($baseConfig, $environmentConfig);
```

### Plugin-Specific Configuration

```php
<?php
// src/config/database.php

return [
    'prefix' => $GLOBALS['wpdb']->prefix . 'my_plugin_',
    
    'tables' => [
        'products' => 'products',
        'categories' => 'categories',
        'orders' => 'orders',
    ],
    
    'migrations' => [
        'auto_run' => wp_get_environment_type() === 'development',
        'table' => 'my_plugin_migrations',
    ],
];
```

## Asset Management

### Asset Organization

```
src/resources/assets/
├── js/
│   ├── admin/
│   │   ├── dashboard.js
│   │   └── settings.js
│   ├── frontend/
│   │   ├── product-list.js
│   │   └── checkout.js
│   └── shared/
│       ├── utilities.js
│       └── api-client.js
├── css/
│   ├── admin/
│   │   ├── dashboard.css
│   │   └── forms.css
│   ├── frontend/
│   │   ├── products.css
│   │   └── widgets.css
│   └── shared/
│       └── common.css
└── images/
    ├── icons/
    ├── logos/
    └── placeholders/
```

### Asset Service

```php
<?php
// src/app/Services/AssetService.php

namespace App\Services;

class AssetService
{
    private $version;
    private $pluginUrl;

    public function __construct()
    {
        $this->version = '1.0.0';
        $this->pluginUrl = plugin_dir_url(__FILE__ . '../../../');
    }

    public function enqueueAdminAssets(): void
    {
        wp_enqueue_style(
            'my-plugin-admin',
            $this->pluginUrl . 'assets/css/admin.css',
            [],
            $this->version
        );

        wp_enqueue_script(
            'my-plugin-admin',
            $this->pluginUrl . 'assets/js/admin.js',
            ['jquery'],
            $this->version,
            true
        );

        wp_localize_script('my-plugin-admin', 'myPluginAdmin', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('my_plugin_admin'),
            'strings' => [
                'confirmDelete' => __('Are you sure?', 'my-plugin'),
            ],
        ]);
    }

    public function enqueueFrontendAssets(): void
    {
        wp_enqueue_style(
            'my-plugin-frontend',
            $this->pluginUrl . 'assets/css/frontend.css',
            [],
            $this->version
        );

        wp_enqueue_script(
            'my-plugin-frontend',
            $this->pluginUrl . 'assets/js/frontend.js',
            ['jquery'],
            $this->version,
            true
        );
    }
}
```

## Best Practices

### 1. Namespace Organization

Use consistent namespacing throughout your application:

```php
<?php

// Base namespace for the plugin
namespace MyCompany\MyPlugin;

// Controllers
namespace MyCompany\MyPlugin\Controllers;

// Models
namespace MyCompany\MyPlugin\Models;

// Services
namespace MyCompany\MyPlugin\Services;

// For modules
namespace MyCompany\MyPlugin\Modules\Product\Controllers;
```

### 2. Dependency Organization

Keep dependencies organized and minimal:

```json
{
    "require": {
        "avelpress/framework": "^1.0"
    },
    "require-dev": {
        "phpunit/phpunit": "^9.0",
        "mockery/mockery": "^1.4"
    },
    "autoload": {
        "psr-4": {
            "MyCompany\\MyPlugin\\": "src/"
        }
    }
}
```

### 3. File Naming Conventions

- Controllers: `ProductController.php`
- Models: `Product.php`
- Services: `ProductService.php`
- Migrations: `2024_01_01_create_products_table.php`
- Tests: `ProductControllerTest.php`

### 4. Folder Organization

Keep related files together and maintain consistent structure across modules and features.

This structure provides a solid foundation for building maintainable, scalable WordPress applications with AvelPress while following modern PHP and Laravel conventions.
