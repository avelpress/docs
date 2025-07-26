# Service Providers

Service Providers are the central place to configure your application. They are responsible for bootstrapping and registering services, loading routes, migrations, and other application components.

## Introduction

Service Providers are classes that register and bootstrap various components of your AvelPress application. Every AvelPress application has at least one service provider: the `AppServiceProvider`. You can create additional service providers to organize your application's bootstrap logic.

## Creating Service Providers

### Manual Creation

Create service provider classes in your `app/Providers` directory:

```php
<?php

namespace App\Providers;

use AvelPress\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register services into the container
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Perform actions after all services are registered
    }
}
```

### Using CLI (if available)

```bash
# Generate a service provider
avel make:provider CustomServiceProvider
```

## Registering Service Providers

Register your service providers in the `bootstrap/providers.php` file:

```php
<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\RouteServiceProvider::class,
    App\Providers\DatabaseServiceProvider::class,
    App\Providers\CustomServiceProvider::class,
];
```

## The Register Method

The `register` method is used to bind services into the service container. You should never attempt to register event listeners, routes, or any other piece of functionality within the `register` method.

### Binding Services

```php
public function register(): void
{
    // Bind a singleton
    $this->app->singleton('my-service', function () {
        return new MyService();
    });

    // Bind an interface to an implementation
    $this->app->bind(PaymentGatewayInterface::class, StripeGateway::class);

    // Bind a concrete class
    $this->app->bind('mailer', MailService::class);

    // Register configuration
    $this->app->instance('config.api', [
        'timeout' => 30,
        'retries' => 3,
    ]);
}
```

### Advanced Binding

```php
public function register(): void
{
    // Conditional binding
    if ($this->app->environment('production')) {
        $this->app->singleton('cache', RedisCache::class);
    } else {
        $this->app->singleton('cache', FileCache::class);
    }

    // Factory binding
    $this->app->bind('notification', function ($app) {
        $config = $app->make('config.notification');
        return new NotificationService($config);
    });

    // Contextual binding
    $this->app->when(EmailService::class)
        ->needs('$apiKey')
        ->give(function () {
            return get_option('email_api_key');
        });
}
```

## The Boot Method

The `boot` method is called after all services have been registered. This is where you should perform any bootstrap logic, load routes, migrations, etc.

### Loading Routes

```php
public function boot(): void
{
    // Load route files
    $this->loadRoutesFrom(__DIR__ . '/../routes/api.php');
    $this->loadRoutesFrom(__DIR__ . '/../routes/admin.php');
}
```

### Loading Migrations

```php
public function boot(): void
{
    // Load migration directories
    $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
    $this->loadMigrationsFrom(__DIR__ . '/../modules/user/migrations');
}
```

### Application Lifecycle

```php
public function boot(): void
{
    // Run migrations after app is booted
    $this->app->booted(function () {
        $migrator = $this->app->make('migrator');
        
        // Check if plugin was updated
        $current_version = get_option('my_plugin_version', '1.0.0');
        if (version_compare(MY_PLUGIN_VERSION, $current_version, '>')) {
            update_option('my_plugin_version', MY_PLUGIN_VERSION);
            $migrator->run();
        }
    });
}
```

## WordPress Integration

### WordPress Hooks and Actions

```php
public function boot(): void
{
    // WordPress hooks
    add_action('init', [$this, 'initializePlugin']);
    add_action('wp_enqueue_scripts', [$this, 'enqueueScripts']);
    add_action('admin_menu', [$this, 'addAdminMenu']);
    
    // WordPress filters
    add_filter('the_content', [$this, 'modifyContent']);
    add_filter('wp_mail', [$this, 'customizeMail']);
    
    // Custom hooks
    add_action('my_plugin_daily_cleanup', [$this, 'performDailyCleanup']);
}

public function initializePlugin()
{
    // Plugin initialization logic
    if (!is_admin()) {
        $this->registerShortcodes();
    }
}

public function enqueueScripts()
{
    wp_enqueue_script(
        'my-plugin-script',
        plugin_dir_url(__FILE__) . 'assets/js/script.js',
        ['jquery'],
        MY_PLUGIN_VERSION,
        true
    );
}
```

### Plugin Activation and Deactivation

```php
public function boot(): void
{
    // Register activation hook
    register_activation_hook(MY_PLUGIN_FILE, [$this, 'activate']);
    register_deactivation_hook(MY_PLUGIN_FILE, [$this, 'deactivate']);
    register_uninstall_hook(MY_PLUGIN_FILE, [static::class, 'uninstall']);
}

public function activate()
{
    // Run migrations
    $this->app->make('migrator')->run();
    
    // Create default options
    add_option('my_plugin_settings', [
        'enabled' => true,
        'api_key' => '',
    ]);
    
    // Schedule cron jobs
    if (!wp_next_scheduled('my_plugin_daily_cleanup')) {
        wp_schedule_event(time(), 'daily', 'my_plugin_daily_cleanup');
    }
}

public function deactivate()
{
    // Clear scheduled cron jobs
    wp_clear_scheduled_hook('my_plugin_daily_cleanup');
}

public static function uninstall()
{
    // Clean up database
    global $wpdb;
    $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}my_plugin_data");
    
    // Remove options
    delete_option('my_plugin_settings');
    delete_option('my_plugin_version');
}
```

## Modular Service Providers

### Feature-Based Service Providers

Organize functionality into focused service providers:

```php
<?php

namespace App\Providers;

use AvelPress\Support\ServiceProvider;
use App\Services\PaymentService;
use App\Services\InvoiceService;

class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PaymentService::class, function () {
            return new PaymentService(
                get_option('payment_gateway', 'stripe'),
                get_option('payment_api_key')
            );
        });

        $this->app->singleton(InvoiceService::class, function ($app) {
            return new InvoiceService($app->make(PaymentService::class));
        });
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../modules/payment/routes.php');
        $this->loadMigrationsFrom(__DIR__ . '/../modules/payment/migrations');
        
        // Payment-specific hooks
        add_action('payment_completed', [$this, 'handlePaymentCompleted']);
        add_action('payment_failed', [$this, 'handlePaymentFailed']);
    }

    public function handlePaymentCompleted($payment_data)
    {
        $invoiceService = $this->app->make(InvoiceService::class);
        $invoiceService->markAsPaid($payment_data['invoice_id']);
    }
}
```

### Module Service Providers

For larger applications, create module-based service providers:

```php
<?php

namespace App\Modules\Quote\Providers;

use AvelPress\Support\ServiceProvider;
use App\Modules\Quote\Services\QuotePdfService;
use App\Modules\Quote\Services\QuoteService;

class QuoteServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(QuotePdfService::class, function () {
            return new QuotePdfService();
        });

        $this->app->bind(QuoteService::class, function () {
            return new QuoteService();
        });
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../Http/routes.php');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        
        // Module-specific customization
        add_filter('quote_pdf_template', [$this, 'customizePdfTemplate']);
    }

    public function customizePdfTemplate($template)
    {
        return __DIR__ . '/../Templates/custom-quote-template.php';
    }
}
```

## Configuration Management

### Loading Configuration

```php
public function register(): void
{
    // Load configuration from files
    $config = require __DIR__ . '/../../config/app.php';
    $this->app->instance('config.app', $config);

    // Environment-based configuration
    $environment = wp_get_environment_type();
    $envConfig = require __DIR__ . "/../../config/{$environment}.php";
    $this->app->instance('config.env', $envConfig);
}
```

### WordPress Options Integration

```php
public function boot(): void
{
    // Merge WordPress options with configuration
    $settings = get_option('my_plugin_settings', []);
    $config = array_merge($this->app->make('config.app'), $settings);
    $this->app->instance('config.merged', $config);
}
```

## Real-World Examples

### Complete AppServiceProvider Example

```php
<?php

namespace Infixs\MegaErp\App\Providers;

use AvelPress\Facades\DB;
use AvelPress\Support\ServiceProvider;
use Infixs\MegaErp\App\Admin\Admin;
use Infixs\MegaErp\App\Services\NotificationService;
use Infixs\MegaErp\App\Services\ReportService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register core services
        $this->app->singleton(NotificationService::class, function () {
            return new NotificationService(
                get_option('notification_settings', [])
            );
        });

        $this->app->singleton(ReportService::class, function ($app) {
            return new ReportService(
                $app->make('database'),
                $app->make(NotificationService::class)
            );
        });

        // Register API configurations
        $this->app->instance('config.api', [
            'version' => 'v1',
            'prefix' => 'infixs-mega-erp',
            'rate_limit' => 100,
        ]);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Handle plugin updates and migrations
        $this->app->booted(function () {
            $current_version = get_option('infixs_mega_erp_version', '1.0.0');
            if (version_compare(INFIXS_MEGA_ERP_PLUGIN_VERSION, $current_version, '>')) {
                update_option('infixs_mega_erp_version', INFIXS_MEGA_ERP_PLUGIN_VERSION);
                $this->app->make('migrator')->run();
            }
            
            // Initialize admin interface
            new Admin();
        });

        // WordPress hooks
        add_action('init', [$this, 'initializePlugin']);
        add_action('admin_enqueue_scripts', [$this, 'enqueueAdminAssets']);
        add_action('wp_ajax_erp_dashboard_data', [$this, 'handleDashboardData']);
        
        // Plugin lifecycle hooks
        register_activation_hook(INFIXS_MEGA_ERP_FILE_NAME, [$this, 'activate']);
        register_deactivation_hook(INFIXS_MEGA_ERP_FILE_NAME, [$this, 'deactivate']);
    }

    public function initializePlugin()
    {
        // Load text domain for translations
        load_plugin_textdomain(
            'infixs-mega-erp',
            false,
            dirname(INFIXS_MEGA_ERP_BASE_NAME) . '/languages'
        );

        // Initialize scheduled tasks
        if (!wp_next_scheduled('erp_daily_reports')) {
            wp_schedule_event(time(), 'daily', 'erp_daily_reports');
        }
    }

    public function enqueueAdminAssets($hook)
    {
        // Only load on our admin pages
        if (strpos($hook, 'mega-erp') !== false) {
            wp_enqueue_script(
                'mega-erp-admin',
                INFIXS_MEGA_ERP_PLUGIN_URL . 'assets/js/admin.js',
                ['jquery'],
                INFIXS_MEGA_ERP_PLUGIN_VERSION,
                true
            );

            wp_localize_script('mega-erp-admin', 'megaErpAjax', [
                'ajaxurl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('mega_erp_nonce'),
                'apiUrl' => home_url('/wp-json/infixs-mega-erp/v1/'),
            ]);
        }
    }

    public function handleDashboardData()
    {
        check_ajax_referer('mega_erp_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_die('Unauthorized');
        }

        $reportService = $this->app->make(ReportService::class);
        $data = $reportService->getDashboardData();
        
        wp_send_json_success($data);
    }

    public function activate()
    {
        // Run database migrations
        $this->app->make('migrator')->run();

        // Create default settings
        add_option('infixs_mega_erp_settings', [
            'currency' => 'USD',
            'tax_rate' => 10,
            'email_notifications' => true,
        ]);

        // Set default user capabilities
        $role = get_role('administrator');
        if ($role) {
            $role->add_cap('manage_mega_erp');
            $role->add_cap('view_erp_reports');
        }
    }

    public function deactivate()
    {
        // Clear scheduled events
        wp_clear_scheduled_hook('erp_daily_reports');
        
        // Clear transients
        delete_transient('erp_dashboard_cache');
    }
}
```

### Event Service Provider

```php
<?php

namespace App\Providers;

use AvelPress\Support\ServiceProvider;
use App\Listeners\SendWelcomeEmail;
use App\Listeners\LogUserActivity;
use App\Listeners\UpdateUserStats;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Event listener mappings.
     */
    protected $listen = [
        'user_registered' => [
            SendWelcomeEmail::class,
            LogUserActivity::class,
        ],
        'user_login' => [
            LogUserActivity::class,
            UpdateUserStats::class,
        ],
        'order_completed' => [
            'App\Listeners\SendOrderConfirmation',
            'App\Listeners\UpdateInventory',
        ],
    ];

    public function boot(): void
    {
        foreach ($this->listen as $event => $listeners) {
            foreach ($listeners as $listener) {
                add_action($event, function (...$args) use ($listener) {
                    $instance = $this->app->make($listener);
                    $instance->handle(...$args);
                });
            }
        }
    }
}
```

## Best Practices

### 1. Keep Register and Boot Separate

```php
// Good - register services only
public function register(): void
{
    $this->app->singleton(MyService::class);
}

// Good - bootstrap after registration
public function boot(): void
{
    $this->loadRoutesFrom(__DIR__ . '/../routes/api.php');
}

// Avoid - bootstrapping in register
public function register(): void
{
    $this->app->singleton(MyService::class);
    $this->loadRoutesFrom(__DIR__ . '/../routes/api.php'); // Wrong!
}
```

### 2. Use Focused Service Providers

```php
// Good - focused providers
class PaymentServiceProvider extends ServiceProvider { }
class NotificationServiceProvider extends ServiceProvider { }
class ReportServiceProvider extends ServiceProvider { }

// Avoid - everything in one provider
class MegaServiceProvider extends ServiceProvider
{
    // Handles payments, notifications, reports, etc.
}
```

### 3. Leverage WordPress Integration

```php
public function boot(): void
{
    // Use WordPress conditionals
    if (is_admin()) {
        $this->registerAdminServices();
    }

    if (wp_doing_cron()) {
        $this->registerCronServices();
    }

    // Respect WordPress capabilities
    if (current_user_can('manage_options')) {
        add_action('admin_menu', [$this, 'addAdminMenu']);
    }
}
```

### 4. Handle Environment Differences

```php
public function register(): void
{
    // Different services for different environments
    if (wp_get_environment_type() === 'production') {
        $this->app->singleton('cache', RedisCache::class);
        $this->app->singleton('logger', ProductionLogger::class);
    } else {
        $this->app->singleton('cache', FileCache::class);
        $this->app->singleton('logger', DebugLogger::class);
    }
}
```

Service Providers are the backbone of your AvelPress application, providing a clean and organized way to bootstrap your application's components while maintaining full compatibility with WordPress.
