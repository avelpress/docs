# Facades

Facades provide a convenient, static interface to classes that are bound in the AvelPress service container. They act as "static proxies" to underlying classes in the service container, providing the benefit of a terse, expressive syntax while maintaining more testability and flexibility than traditional static methods.

## How Facades Work

AvelPress facades are classes that provide access to objects from the container using a simple, static interface. All AvelPress facades extend the base `AvelPress\Facades\Facade` class.

### Facade Class Structure

```php
<?php

namespace AvelPress\Facades;

class Route extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return 'router';
    }
}
```

When you call a static method on a facade, AvelPress resolves the bound instance from the service container and runs the requested method against that object.

## Built-in Facades

AvelPress comes with several built-in facades:

### Route Facade

The Route facade provides access to the router:

```php
<?php

use AvelPress\Facades\Route;

// Define routes
Route::get('/api/users', [UserController::class, 'index']);
Route::post('/api/users', [UserController::class, 'store']);

// Route groups
Route::prefix('api/v1')->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
});

// Route with middleware
Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])
     ->guards(['manage_options']);
```

### DB Facade

The DB facade provides access to the database layer:

```php
<?php

use AvelPress\Facades\DB;

// Raw queries
$users = DB::select('SELECT * FROM users WHERE active = ?', [1]);

// Query builder
$products = DB::table('products')
    ->where('status', 'active')
    ->orderBy('created_at', 'desc')
    ->get();

// Transactions
DB::transaction(function () {
    DB::table('orders')->insert([
        'user_id' => 1,
        'total' => 99.99,
    ]);
    
    DB::table('order_items')->insert([
        'order_id' => DB::getPdo()->lastInsertId(),
        'product_id' => 1,
        'quantity' => 2,
    ]);
});
```

### Config Facade

The Config facade provides access to configuration values:

```php
<?php

use AvelPress\Facades\Config;

// Get configuration value
$appName = Config::get('app.name', 'Default App Name');

// Set configuration value
Config::set('app.debug', true);

// Check if configuration exists
if (Config::has('database.connections.mysql')) {
    // Configuration exists
}

// Get all configuration
$allConfig = Config::all();
```

### Schema Facade

The Schema facade provides access to database schema operations:

```php
<?php

use AvelPress\Facades\Schema;

// Create table
Schema::create('products', function ($table) {
    $table->id();
    $table->string('name');
    $table->decimal('price', 8, 2);
    $table->timestamps();
});

// Modify table
Schema::table('products', function ($table) {
    $table->string('sku')->after('name');
    $table->index('sku');
});

// Drop table
Schema::drop('old_table');

// Check if table exists
if (Schema::hasTable('products')) {
    // Table exists
}
```

## Creating Custom Facades

You can create your own facades for any service bound in the container.

### Step 1: Create the Service Class

```php
<?php

namespace App\Services;

class PaymentService
{
    private $gateway;
    private $logger;

    public function __construct(PaymentGateway $gateway, Logger $logger)
    {
        $this->gateway = $gateway;
        $this->logger = $logger;
    }

    public function charge($amount, $token): array
    {
        $this->logger->info("Processing payment for amount: {$amount}");
        
        try {
            $result = $this->gateway->charge($amount, $token);
            $this->logger->info("Payment successful", $result);
            return $result;
        } catch (\Exception $e) {
            $this->logger->error("Payment failed: " . $e->getMessage());
            throw $e;
        }
    }

    public function refund($chargeId, $amount = null): array
    {
        $this->logger->info("Processing refund for charge: {$chargeId}");
        
        return $this->gateway->refund($chargeId, $amount);
    }

    public function getTransactionHistory($userId): array
    {
        return $this->gateway->getTransactions($userId);
    }
}
```

### Step 2: Bind the Service in a Service Provider

```php
<?php

namespace App\Providers;

use AvelPress\Support\ServiceProvider;
use App\Services\PaymentService;
use App\Services\StripeGateway;

class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton('payment', function ($app) {
            return new PaymentService(
                new StripeGateway(config('payment.stripe_key')),
                $app->make('logger')
            );
        });
    }
}
```

### Step 3: Create the Facade

```php
<?php

namespace App\Facades;

use AvelPress\Facades\Facade;

class Payment extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return 'payment';
    }
}
```

### Step 4: Use the Facade

```php
<?php

use App\Facades\Payment;

// Process a payment
$result = Payment::charge(99.99, $creditCardToken);

// Process a refund
$refund = Payment::refund($chargeId, 50.00);

// Get transaction history
$transactions = Payment::getTransactionHistory($userId);
```

## WordPress-Specific Facades

### WP Facade for WordPress Functions

```php
<?php

namespace App\Facades;

use AvelPress\Facades\Facade;

class WP extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'wp.helper';
    }
}

// Service class
namespace App\Services;

class WordPressHelper
{
    public function getCurrentUser()
    {
        return wp_get_current_user();
    }

    public function isUserLoggedIn(): bool
    {
        return is_user_logged_in();
    }

    public function getCurrentUserCan($capability): bool
    {
        return current_user_can($capability);
    }

    public function getOption($option, $default = false)
    {
        return get_option($option, $default);
    }

    public function updateOption($option, $value): bool
    {
        return update_option($option, $value);
    }

    public function addAction($hook, $callback, $priority = 10, $args = 1): void
    {
        add_action($hook, $callback, $priority, $args);
    }

    public function doAction($hook, ...$args): void
    {
        do_action($hook, ...$args);
    }

    public function applyFilters($hook, $value, ...$args)
    {
        return apply_filters($hook, $value, ...$args);
    }
}

// Usage
use App\Facades\WP;

if (WP::isUserLoggedIn() && WP::getCurrentUserCan('manage_options')) {
    WP::updateOption('my_plugin_setting', $newValue);
}
```

### Post Facade for WordPress Posts

```php
<?php

namespace App\Facades;

use AvelPress\Facades\Facade;

class Post extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'post.manager';
    }
}

// Service class
namespace App\Services;

class PostManager
{
    public function create(array $data): int
    {
        $postData = wp_parse_args($data, [
            'post_status' => 'publish',
            'post_type' => 'post',
        ]);

        $postId = wp_insert_post($postData);
        
        if (is_wp_error($postId)) {
            throw new \Exception('Failed to create post: ' . $postId->get_error_message());
        }

        return $postId;
    }

    public function update(int $postId, array $data): bool
    {
        $data['ID'] = $postId;
        $result = wp_update_post($data);
        
        return !is_wp_error($result);
    }

    public function delete(int $postId, bool $forceDelete = false): bool
    {
        $result = wp_delete_post($postId, $forceDelete);
        return $result !== false;
    }

    public function getMeta(int $postId, string $key, bool $single = true)
    {
        return get_post_meta($postId, $key, $single);
    }

    public function setMeta(int $postId, string $key, $value): bool
    {
        return update_post_meta($postId, $key, $value) !== false;
    }

    public function find(int $postId): ?\WP_Post
    {
        $post = get_post($postId);
        return $post instanceof \WP_Post ? $post : null;
    }
}

// Usage
use App\Facades\Post;

// Create a new post
$postId = Post::create([
    'post_title' => 'My New Post',
    'post_content' => 'This is the post content.',
    'post_type' => 'product',
]);

// Set meta data
Post::setMeta($postId, 'price', 99.99);

// Get meta data
$price = Post::getMeta($postId, 'price');
```

## Real-World Facade Examples

### Cache Facade

```php
<?php

namespace App\Facades;

use AvelPress\Facades\Facade;

class Cache extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'cache';
    }
}

// Service class
namespace App\Services;

class CacheService
{
    public function get($key, $default = null)
    {
        $value = wp_cache_get($key, 'my_plugin');
        return $value !== false ? $value : $default;
    }

    public function set($key, $value, $expiration = 3600): bool
    {
        return wp_cache_set($key, $value, 'my_plugin', $expiration);
    }

    public function forget($key): bool
    {
        return wp_cache_delete($key, 'my_plugin');
    }

    public function flush(): bool
    {
        return wp_cache_flush();
    }

    public function remember($key, $expiration, \Closure $callback)
    {
        $value = $this->get($key);
        
        if ($value !== null) {
            return $value;
        }

        $value = $callback();
        $this->set($key, $value, $expiration);

        return $value;
    }
}

// Usage
use App\Facades\Cache;

// Cache expensive operation
$users = Cache::remember('active_users', 3600, function () {
    return User::where('status', 'active')->get();
});

// Set cache
Cache::set('user_count', 1500, 1800);

// Get from cache
$count = Cache::get('user_count', 0);
```

### Mail Facade

```php
<?php

namespace App\Facades;

use AvelPress\Facades\Facade;

class Mail extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'mail';
    }
}

// Service class
namespace App\Services;

class MailService
{
    public function send($to, $subject, $message, $headers = []): bool
    {
        $defaultHeaders = [
            'Content-Type: text/html; charset=UTF-8',
        ];

        $headers = array_merge($defaultHeaders, $headers);

        return wp_mail($to, $subject, $message, $headers);
    }

    public function sendTemplate($to, $template, $data = [], $headers = []): bool
    {
        $subject = $this->renderTemplate($template . '_subject', $data);
        $message = $this->renderTemplate($template, $data);

        return $this->send($to, $subject, $message, $headers);
    }

    private function renderTemplate($template, $data = []): string
    {
        extract($data);
        
        ob_start();
        include plugin_dir_path(__FILE__) . "../templates/{$template}.php";
        return ob_get_clean();
    }

    public function queue($to, $subject, $message, $headers = []): void
    {
        // Add to queue for later processing
        wp_schedule_single_event(time() + 60, 'send_queued_email', [
            $to, $subject, $message, $headers
        ]);
    }
}

// Usage
use App\Facades\Mail;

// Send simple email
Mail::send('user@example.com', 'Welcome!', '<h1>Welcome to our site!</h1>');

// Send template email
Mail::sendTemplate('user@example.com', 'welcome', [
    'name' => 'John Doe',
    'login_url' => wp_login_url(),
]);

// Queue email for later
Mail::queue('user@example.com', 'Newsletter', $newsletterContent);
```

## Testing with Facades

Facades make testing easier by allowing you to mock the underlying services:

```php
<?php

use PHPUnit\Framework\TestCase;
use App\Facades\Payment;
use App\Services\PaymentService;

class PaymentTest extends TestCase
{
    public function testChargePayment()
    {
        // Create a mock of the payment service
        $mockPaymentService = $this->createMock(PaymentService::class);
        
        // Set up expectations
        $mockPaymentService->expects($this->once())
            ->method('charge')
            ->with(99.99, 'token_123')
            ->willReturn(['success' => true, 'charge_id' => 'ch_123']);

        // Replace the facade's underlying instance
        Payment::swap($mockPaymentService);

        // Test the facade
        $result = Payment::charge(99.99, 'token_123');

        $this->assertTrue($result['success']);
        $this->assertEquals('ch_123', $result['charge_id']);
    }

    protected function tearDown(): void
    {
        // Clear any swapped instances
        Payment::clearResolvedInstances();
    }
}
```

## Facade Best Practices

### 1. Use Facades for Convenience, Not Everything

```php
<?php

// Good: Using facades for common operations
$users = DB::table('users')->where('active', 1)->get();
Route::get('/api/users', [UserController::class, 'index']);

// Consider dependency injection for complex services
class UserService
{
    public function __construct(
        private EmailService $emailService,
        private UserRepository $userRepository
    ) {}
}
```

### 2. Provide Type Hints in IDEs

Create a facade helper file for IDE support:

```php
<?php

namespace App\Facades {
    /**
     * @method static bool charge(float $amount, string $token)
     * @method static array refund(string $chargeId, float $amount = null)
     * @method static array getTransactionHistory(int $userId)
     */
    class Payment extends \AvelPress\Facades\Facade {}
}
```

### 3. Document Facade Methods

```php
<?php

namespace App\Facades;

use AvelPress\Facades\Facade;

/**
 * Cache Facade
 *
 * @method static mixed get(string $key, mixed $default = null)
 * @method static bool set(string $key, mixed $value, int $expiration = 3600)
 * @method static bool forget(string $key)
 * @method static bool flush()
 * @method static mixed remember(string $key, int $expiration, \Closure $callback)
 *
 * @see \App\Services\CacheService
 */
class Cache extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'cache';
    }
}
```

Facades provide a clean, readable way to access services while maintaining the benefits of dependency injection and testability. They're particularly useful for common operations that you need to access throughout your application.
