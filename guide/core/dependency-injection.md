# Dependency Injection

AvelPress includes a powerful dependency injection container that manages class dependencies and performs dependency injection. The container automatically resolves class dependencies by examining the constructor parameters using PHP's reflection capabilities.

## Introduction to Dependency Injection

Dependency injection is a technique for achieving Inversion of Control (IoC) between classes and their dependencies. Instead of a class creating its own dependencies, they are "injected" from the outside.

### Benefits

- **Loose Coupling**: Classes depend on abstractions, not concrete implementations
- **Testability**: Easy to mock dependencies for unit testing
- **Flexibility**: Easy to swap implementations
- **Maintainability**: Changes to dependencies don't affect dependent classes

## The Service Container

The AvelPress service container is the central registry for managing class dependencies and performing dependency injection.

### Basic Container Usage

```php
<?php

use AvelPress\AvelPress;

// Get the application container
$app = AvelPress::app();

// Bind a service to the container
$app->bind('payment.gateway', PaymentGateway::class);

// Resolve a service from the container
$gateway = $app->make('payment.gateway');
```

## Binding Services

### Simple Binding

The most basic way to register a service is using the `bind` method:

```php
<?php

// Bind a concrete class
$app->bind('mailer', EmailService::class);

// Bind an interface to an implementation
$app->bind(PaymentGatewayInterface::class, StripePaymentGateway::class);

// Bind with a closure
$app->bind('payment.processor', function () {
    return new PaymentProcessor(
        new StripeGateway(),
        new EmailNotifier()
    );
});
```

### Singleton Binding

When you want the same instance to be returned every time:

```php
<?php

// Bind as singleton
$app->singleton('database', function () {
    return new DatabaseConnection([
        'host' => 'localhost',
        'database' => 'myapp',
        'username' => 'user',
        'password' => 'pass'
    ]);
});

// This will always return the same instance
$db1 = $app->make('database');
$db2 = $app->make('database');
// $db1 === $db2 (true)
```

### Instance Binding

You can bind an existing instance to the container:

```php
<?php

$logger = new FileLogger('/path/to/logs');
$app->instance('logger', $logger);

// Will always return the exact same instance
$retrievedLogger = $app->make('logger');
```

## Automatic Resolution

The container can automatically resolve classes without explicit binding:

```php
<?php

class EmailService
{
    private $mailer;
    private $logger;

    public function __construct(MailerInterface $mailer, LoggerInterface $logger)
    {
        $this->mailer = $mailer;
        $this->logger = $logger;
    }

    public function send($to, $subject, $message)
    {
        $this->logger->info("Sending email to: {$to}");
        return $this->mailer->send($to, $subject, $message);
    }
}

// The container will automatically resolve dependencies
$emailService = $app->make(EmailService::class);
```

## Constructor Injection

The most common form of dependency injection in AvelPress is constructor injection:

```php
<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Services\EmailService;

class UserService
{
    private $userRepository;
    private $emailService;

    public function __construct(UserRepository $userRepository, EmailService $emailService)
    {
        $this->userRepository = $userRepository;
        $this->emailService = $emailService;
    }

    public function createUser(array $data): User
    {
        $user = $this->userRepository->create($data);
        
        $this->emailService->send(
            $user->email,
            'Welcome!',
            'Welcome to our application!'
        );

        return $user;
    }
}
```

## Method Injection

AvelPress also supports method-level dependency injection in controllers:

```php
<?php

namespace App\Controllers;

use AvelPress\Routing\Controller;
use App\Services\UserService;
use App\Services\EmailService;

class UserController extends Controller
{
    public function store($request, UserService $userService, EmailService $emailService)
    {
        // Dependencies are automatically injected
        $user = $userService->createUser($request->all());
        
        return response()->json($user);
    }

    public function sendWelcomeEmail($request, EmailService $emailService)
    {
        $user = User::find($request->get_param('id'));
        
        $emailService->send(
            $user->email,
            'Welcome Back!',
            'Thanks for returning to our app!'
        );

        return response()->json(['message' => 'Email sent successfully']);
    }
}
```

## Service Providers and Dependency Injection

Service providers are the perfect place to configure your container bindings:

```php
<?php

namespace App\Providers;

use AvelPress\Support\ServiceProvider;
use App\Services\PaymentService;
use App\Services\EmailService;
use App\Contracts\PaymentGatewayInterface;
use App\Services\Gateways\StripeGateway;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind interfaces to implementations
        $this->app->bind(PaymentGatewayInterface::class, StripeGateway::class);

        // Bind complex services
        $this->app->singleton(PaymentService::class, function ($app) {
            return new PaymentService(
                $app->make(PaymentGatewayInterface::class),
                $app->make(EmailService::class),
                config('payment.default_currency', 'USD')
            );
        });

        // Bind with configuration
        $this->app->singleton('stripe.gateway', function () {
            return new StripeGateway([
                'api_key' => get_option('stripe_api_key'),
                'webhook_secret' => get_option('stripe_webhook_secret'),
            ]);
        });
    }
}
```

## WordPress Integration Examples

### WordPress Service Integration

```php
<?php

namespace App\Services;

class WordPressIntegrationService
{
    private $optionsService;
    private $metaService;

    public function __construct(OptionsService $optionsService, MetaService $metaService)
    {
        $this->optionsService = $optionsService;
        $this->metaService = $metaService;
    }

    public function getUserPreferences($userId): array
    {
        return [
            'email_notifications' => $this->metaService->getUserMeta($userId, 'email_notifications'),
            'theme_preference' => $this->optionsService->get('default_theme'),
            'language' => get_user_locale($userId),
        ];
    }
}

class OptionsService
{
    public function get($key, $default = null)
    {
        return get_option($key, $default);
    }

    public function set($key, $value): bool
    {
        return update_option($key, $value);
    }
}

class MetaService
{
    public function getUserMeta($userId, $key, $single = true)
    {
        return get_user_meta($userId, $key, $single);
    }

    public function setUserMeta($userId, $key, $value): bool
    {
        return update_user_meta($userId, $key, $value) !== false;
    }

    public function getPostMeta($postId, $key, $single = true)
    {
        return get_post_meta($postId, $key, $single);
    }

    public function setPostMeta($postId, $key, $value): bool
    {
        return update_post_meta($postId, $key, $value) !== false;
    }
}
```

### Plugin Service Provider Example

```php
<?php

namespace MyPlugin\Providers;

use AvelPress\Support\ServiceProvider;
use MyPlugin\Services\ProductService;
use MyPlugin\Services\OrderService;
use MyPlugin\Services\EmailService;
use MyPlugin\Repositories\ProductRepository;
use MyPlugin\Repositories\OrderRepository;

class PluginServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Repository bindings
        $this->app->singleton(ProductRepository::class);
        $this->app->singleton(OrderRepository::class);

        // Service bindings with dependencies
        $this->app->singleton(ProductService::class, function ($app) {
            return new ProductService(
                $app->make(ProductRepository::class),
                $app->make(EmailService::class)
            );
        });

        $this->app->singleton(OrderService::class, function ($app) {
            return new OrderService(
                $app->make(OrderRepository::class),
                $app->make(ProductService::class),
                $app->make(EmailService::class)
            );
        });

        // WordPress-specific services
        $this->app->singleton('wp.hooks', function () {
            return new WordPressHookService();
        });
    }

    public function boot(): void
    {
        // Register WordPress hooks using injected services
        $orderService = $this->app->make(OrderService::class);
        
        add_action('woocommerce_order_status_completed', [$orderService, 'handleOrderCompleted']);
        add_action('wp_ajax_create_custom_order', [$orderService, 'createOrderViaAjax']);
    }
}
```

## Advanced Patterns

### Factory Pattern with Dependency Injection

```php
<?php

namespace App\Factories;

use App\Services\EmailService;
use App\Services\SMSService;

class NotificationFactory
{
    private $emailService;
    private $smsService;

    public function __construct(EmailService $emailService, SMSService $smsService)
    {
        $this->emailService = $emailService;
        $this->smsService = $smsService;
    }

    public function create($type)
    {
        switch ($type) {
            case 'email':
                return $this->emailService;
            case 'sms':
                return $this->smsService;
            default:
                throw new \InvalidArgumentException("Unknown notification type: {$type}");
        }
    }
}

// In a service provider
$this->app->singleton(NotificationFactory::class);

// Usage in a controller
public function sendNotification($request, NotificationFactory $factory)
{
    $type = $request->get_param('type');
    $notifier = $factory->create($type);
    
    $notifier->send($request->get_param('message'));
}
```

### Conditional Binding

```php
<?php

// In a service provider
public function register(): void
{
    // Bind different implementations based on environment
    if (wp_get_environment_type() === 'production') {
        $this->app->bind(LoggerInterface::class, ProductionLogger::class);
    } else {
        $this->app->bind(LoggerInterface::class, DebugLogger::class);
    }

    // Bind based on WordPress configuration
    if (is_multisite()) {
        $this->app->bind('cache.driver', MultisiteCacheDriver::class);
    } else {
        $this->app->bind('cache.driver', SingleSiteCacheDriver::class);
    }

    // Bind based on plugin availability
    if (class_exists('WooCommerce')) {
        $this->app->bind(ECommerceInterface::class, WooCommerceAdapter::class);
    } elseif (class_exists('EDD')) {
        $this->app->bind(ECommerceInterface::class, EDDAdapter::class);
    } else {
        $this->app->bind(ECommerceInterface::class, GenericECommerceAdapter::class);
    }
}
```

### Decorator Pattern with DI

```php
<?php

namespace App\Services;

class CachedUserService implements UserServiceInterface
{
    private $userService;
    private $cache;

    public function __construct(UserService $userService, CacheService $cache)
    {
        $this->userService = $userService;
        $this->cache = $cache;
    }

    public function getUser($id): ?User
    {
        $cacheKey = "user.{$id}";
        
        if ($cached = $this->cache->get($cacheKey)) {
            return $cached;
        }

        $user = $this->userService->getUser($id);
        
        if ($user) {
            $this->cache->set($cacheKey, $user, 3600); // 1 hour
        }

        return $user;
    }
}

// In service provider
$this->app->bind(UserServiceInterface::class, function ($app) {
    $baseService = new UserService($app->make(UserRepository::class));
    return new CachedUserService($baseService, $app->make(CacheService::class));
});
```

## Testing with Dependency Injection

Dependency injection makes testing much easier:

```php
<?php

use PHPUnit\Framework\TestCase;

class UserServiceTest extends TestCase
{
    public function testCreateUserSendsWelcomeEmail()
    {
        // Create mocks
        $userRepository = $this->createMock(UserRepository::class);
        $emailService = $this->createMock(EmailService::class);

        // Set up expectations
        $userRepository->expects($this->once())
            ->method('create')
            ->willReturn(new User(['id' => 1, 'email' => 'test@example.com']));

        $emailService->expects($this->once())
            ->method('send')
            ->with('test@example.com', 'Welcome!', $this->anything());

        // Create service with injected mocks
        $userService = new UserService($userRepository, $emailService);

        // Test the method
        $user = $userService->createUser(['email' => 'test@example.com']);

        $this->assertInstanceOf(User::class, $user);
    }
}
```

## Best Practices

### 1. Use Interface Segregation

```php
<?php

// Good: Small, focused interfaces
interface EmailSenderInterface
{
    public function send($to, $subject, $message): bool;
}

interface EmailValidatorInterface
{
    public function validate($email): bool;
}

// Bad: Large interface with many responsibilities
interface EmailInterface
{
    public function send($to, $subject, $message): bool;
    public function validate($email): bool;
    public function queue($email): void;
    public function process(): void;
    public function retry($id): void;
}
```

### 2. Avoid Service Location Anti-pattern

```php
<?php

// Bad: Service location
class UserController
{
    public function store($request)
    {
        $userService = AvelPress::app(UserService::class); // Anti-pattern
        return $userService->create($request->all());
    }
}

// Good: Dependency injection
class UserController
{
    private $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function store($request)
    {
        return $this->userService->create($request->all());
    }
}
```

### 3. Use Type Hints

```php
<?php

// Good: Clear type hints
public function __construct(
    UserRepository $userRepository,
    EmailService $emailService,
    LoggerInterface $logger
) {
    $this->userRepository = $userRepository;
    $this->emailService = $emailService;
    $this->logger = $logger;
}

// Bad: No type hints
public function __construct($userRepository, $emailService, $logger)
{
    $this->userRepository = $userRepository;
    $this->emailService = $emailService;
    $this->logger = $logger;
}
```

The dependency injection container in AvelPress provides a robust foundation for building maintainable, testable, and flexible WordPress applications.
