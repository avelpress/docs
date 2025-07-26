# WordPress Integration Guide

AvelPress is designed to work seamlessly with WordPress, providing a modern framework experience while maintaining full compatibility with WordPress core, plugins, and themes. This guide covers all aspects of WordPress integration.

## Plugin Structure

### Basic Plugin Structure

```
my-awesome-plugin/
├── my-awesome-plugin.php          # Main plugin file
├── composer.json                  # Composer dependencies
├── .gitignore
├── README.md
├── src/
│   ├── Plugin.php                 # Plugin bootstrap class
│   ├── Providers/
│   │   ├── AppServiceProvider.php
│   │   └── WordPressServiceProvider.php
│   ├── Controllers/
│   │   ├── AdminController.php
│   │   ├── FrontendController.php
│   │   └── AjaxController.php
│   ├── Models/
│   │   ├── Post.php
│   │   ├── User.php
│   │   └── CustomModel.php
│   ├── Http/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Admin/
│   │   ├── Pages/
│   │   └── Metaboxes/
│   └── Frontend/
│       ├── Shortcodes/
│       └── Widgets/
├── database/
│   └── migrations/
├── resources/
│   ├── views/
│   ├── assets/
│   │   ├── js/
│   │   └── css/
│   └── templates/
└── vendor/
```

### Main Plugin File

```php
<?php
/**
 * Plugin Name: My Awesome Plugin
 * Plugin URI: https://example.com/my-awesome-plugin
 * Description: A powerful WordPress plugin built with AvelPress framework.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL v2 or later
 * Text Domain: my-awesome-plugin
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('MY_AWESOME_PLUGIN_VERSION', '1.0.0');
define('MY_AWESOME_PLUGIN_FILE', __FILE__);
define('MY_AWESOME_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('MY_AWESOME_PLUGIN_URL', plugin_dir_url(__FILE__));

// Load Composer autoloader
require_once __DIR__ . '/vendor/autoload.php';

// Initialize the plugin
add_action('plugins_loaded', function () {
    \MyAwesomePlugin\Plugin::getInstance();
});

// Activation hook
register_activation_hook(__FILE__, function () {
    \MyAwesomePlugin\Plugin::activate();
});

// Deactivation hook
register_deactivation_hook(__FILE__, function () {
    \MyAwesomePlugin\Plugin::deactivate();
});

// Uninstall hook
register_uninstall_hook(__FILE__, function () {
    \MyAwesomePlugin\Plugin::uninstall();
});
```

## Plugin Bootstrap Class

### Main Plugin Class

```php
<?php
// src/Plugin.php

namespace MyAwesomePlugin;

use AvelPress\Foundation\Application;
use MyAwesomePlugin\Providers\AppServiceProvider;
use MyAwesomePlugin\Providers\WordPressServiceProvider;

class Plugin
{
    private static $instance = null;
    private $app;

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {
        $this->initializeFramework();
        $this->loadTextDomain();
        $this->init();
    }

    private function initializeFramework(): void
    {
        // Create AvelPress application instance
        $this->app = new Application(MY_AWESOME_PLUGIN_PATH);

        // Register service providers
        $this->app->register(new AppServiceProvider($this->app));
        $this->app->register(new WordPressServiceProvider($this->app));

        // Boot the application
        $this->app->boot();
    }

    private function loadTextDomain(): void
    {
        load_plugin_textdomain(
            'my-awesome-plugin',
            false,
            dirname(plugin_basename(MY_AWESOME_PLUGIN_FILE)) . '/languages'
        );
    }

    private function init(): void
    {
        // Plugin initialization hooks
        add_action('init', [$this, 'onInit']);
        add_action('admin_init', [$this, 'onAdminInit']);
        add_action('wp_enqueue_scripts', [$this, 'enqueueFrontendAssets']);
        add_action('admin_enqueue_scripts', [$this, 'enqueueAdminAssets']);
    }

    public function onInit(): void
    {
        // Register custom post types
        $this->registerPostTypes();
        
        // Register taxonomies
        $this->registerTaxonomies();
        
        // Register shortcodes
        $this->registerShortcodes();
        
        // Initialize REST API routes
        $this->initializeRestRoutes();
    }

    public function onAdminInit(): void
    {
        // Add admin pages
        $this->addAdminPages();
        
        // Add meta boxes
        $this->addMetaBoxes();
    }

    public function enqueueFrontendAssets(): void
    {
        wp_enqueue_style(
            'my-awesome-plugin-frontend',
            MY_AWESOME_PLUGIN_URL . 'resources/assets/css/frontend.css',
            [],
            MY_AWESOME_PLUGIN_VERSION
        );

        wp_enqueue_script(
            'my-awesome-plugin-frontend',
            MY_AWESOME_PLUGIN_URL . 'resources/assets/js/frontend.js',
            ['jquery'],
            MY_AWESOME_PLUGIN_VERSION,
            true
        );

        // Localize script with data
        wp_localize_script('my-awesome-plugin-frontend', 'myAwesomePluginAjax', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('my_awesome_plugin_nonce'),
            'strings' => [
                'loading' => __('Loading...', 'my-awesome-plugin'),
                'error' => __('An error occurred', 'my-awesome-plugin'),
            ],
        ]);
    }

    public function enqueueAdminAssets($hook): void
    {
        // Only load on our admin pages
        if (strpos($hook, 'my-awesome-plugin') === false) {
            return;
        }

        wp_enqueue_style(
            'my-awesome-plugin-admin',
            MY_AWESOME_PLUGIN_URL . 'resources/assets/css/admin.css',
            [],
            MY_AWESOME_PLUGIN_VERSION
        );

        wp_enqueue_script(
            'my-awesome-plugin-admin',
            MY_AWESOME_PLUGIN_URL . 'resources/assets/js/admin.js',
            ['jquery', 'wp-api'],
            MY_AWESOME_PLUGIN_VERSION,
            true
        );
    }

    private function registerPostTypes(): void
    {
        // Register custom post type using WordPress functions
        register_post_type('awesome_product', [
            'labels' => [
                'name' => __('Products', 'my-awesome-plugin'),
                'singular_name' => __('Product', 'my-awesome-plugin'),
            ],
            'public' => true,
            'has_archive' => true,
            'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
            'show_in_rest' => true,
            'rest_base' => 'awesome-products',
        ]);
    }

    private function registerTaxonomies(): void
    {
        register_taxonomy('product_category', 'awesome_product', [
            'labels' => [
                'name' => __('Product Categories', 'my-awesome-plugin'),
                'singular_name' => __('Product Category', 'my-awesome-plugin'),
            ],
            'hierarchical' => true,
            'public' => true,
            'show_in_rest' => true,
        ]);
    }

    private function registerShortcodes(): void
    {
        add_shortcode('awesome_products', [$this, 'renderProductsShortcode']);
        add_shortcode('awesome_product_form', [$this, 'renderProductFormShortcode']);
    }

    private function initializeRestRoutes(): void
    {
        // REST API routes are handled by RouterServiceProvider
        // through the AvelPress routing system
    }

    private function addAdminPages(): void
    {
        add_action('admin_menu', function () {
            // Main menu page
            add_menu_page(
                __('My Awesome Plugin', 'my-awesome-plugin'),
                __('Awesome Plugin', 'my-awesome-plugin'),
                'manage_options',
                'my-awesome-plugin',
                [$this, 'renderMainAdminPage'],
                'dashicons-star-filled',
                30
            );

            // Submenu pages
            add_submenu_page(
                'my-awesome-plugin',
                __('Products', 'my-awesome-plugin'),
                __('Products', 'my-awesome-plugin'),
                'manage_options',
                'my-awesome-plugin-products',
                [$this, 'renderProductsAdminPage']
            );

            add_submenu_page(
                'my-awesome-plugin',
                __('Settings', 'my-awesome-plugin'),
                __('Settings', 'my-awesome-plugin'),
                'manage_options',
                'my-awesome-plugin-settings',
                [$this, 'renderSettingsAdminPage']
            );
        });
    }

    private function addMetaBoxes(): void
    {
        add_action('add_meta_boxes', function () {
            add_meta_box(
                'awesome_product_details',
                __('Product Details', 'my-awesome-plugin'),
                [$this, 'renderProductMetaBox'],
                'awesome_product',
                'normal',
                'high'
            );
        });

        // Save meta box data
        add_action('save_post', [$this, 'saveProductMetaBox']);
    }

    // Shortcode callbacks
    public function renderProductsShortcode($atts): string
    {
        $atts = shortcode_atts([
            'limit' => 10,
            'category' => '',
            'orderby' => 'date',
            'order' => 'DESC',
        ], $atts);

        // Use AvelPress to render the shortcode
        $controller = $this->app->make(Controllers\FrontendController::class);
        return $controller->renderProductsShortcode($atts);
    }

    public function renderProductFormShortcode($atts): string
    {
        $controller = $this->app->make(Controllers\FrontendController::class);
        return $controller->renderProductFormShortcode($atts);
    }

    // Admin page callbacks
    public function renderMainAdminPage(): void
    {
        $controller = $this->app->make(Controllers\AdminController::class);
        $controller->renderDashboard();
    }

    public function renderProductsAdminPage(): void
    {
        $controller = $this->app->make(Controllers\AdminController::class);
        $controller->renderProductsPage();
    }

    public function renderSettingsAdminPage(): void
    {
        $controller = $this->app->make(Controllers\AdminController::class);
        $controller->renderSettingsPage();
    }

    // Meta box callbacks
    public function renderProductMetaBox($post): void
    {
        $controller = $this->app->make(Controllers\AdminController::class);
        $controller->renderProductMetaBox($post);
    }

    public function saveProductMetaBox($post_id): void
    {
        $controller = $this->app->make(Controllers\AdminController::class);
        $controller->saveProductMetaBox($post_id);
    }

    // Plugin lifecycle methods
    public static function activate(): void
    {
        // Create database tables
        self::createTables();
        
        // Set default options
        self::setDefaultOptions();
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }

    public static function deactivate(): void
    {
        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Clear scheduled hooks
        wp_clear_scheduled_hook('my_awesome_plugin_cron');
    }

    public static function uninstall(): void
    {
        // Remove options
        delete_option('my_awesome_plugin_settings');
        
        // Drop custom tables
        self::dropTables();
        
        // Remove capabilities
        self::removeCapabilities();
    }

    private static function createTables(): void
    {
        // Run migrations using AvelPress
        $migrator = new \AvelPress\Database\Migrations\Migrator();
        $migrator->runMigrations(MY_AWESOME_PLUGIN_PATH . 'database/migrations');
    }

    private static function dropTables(): void
    {
        global $wpdb;
        
        $tables = [
            $wpdb->prefix . 'awesome_products_custom',
            $wpdb->prefix . 'awesome_analytics',
        ];

        foreach ($tables as $table) {
            $wpdb->query("DROP TABLE IF EXISTS {$table}");
        }
    }

    private static function setDefaultOptions(): void
    {
        $defaults = [
            'enable_frontend_submission' => true,
            'products_per_page' => 12,
            'enable_analytics' => true,
            'email_notifications' => true,
        ];

        add_option('my_awesome_plugin_settings', $defaults);
    }

    private static function removeCapabilities(): void
    {
        $roles = ['administrator', 'editor'];
        $capabilities = [
            'manage_awesome_products',
            'edit_awesome_products',
            'delete_awesome_products',
        ];

        foreach ($roles as $role_name) {
            $role = get_role($role_name);
            if ($role) {
                foreach ($capabilities as $cap) {
                    $role->remove_cap($cap);
                }
            }
        }
    }

    public function getApp(): Application
    {
        return $this->app;
    }
}
```

## WordPress Service Provider

### WordPress Integration Provider

```php
<?php
// src/Providers/WordPressServiceProvider.php

namespace MyAwesomePlugin\Providers;

use AvelPress\Support\ServiceProvider;
use MyAwesomePlugin\Controllers\AjaxController;

class WordPressServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Register WordPress-specific services
        $this->app->bind('wordpress.options', function () {
            return new \MyAwesomePlugin\Services\OptionsService();
        });

        $this->app->bind('wordpress.meta', function () {
            return new \MyAwesomePlugin\Services\MetaService();
        });
    }

    public function boot(): void
    {
        $this->registerAjaxHandlers();
        $this->registerCronJobs();
        $this->registerCapabilities();
        $this->setupCustomFields();
        $this->registerWidgets();
    }

    private function registerAjaxHandlers(): void
    {
        $ajaxController = $this->app->make(AjaxController::class);

        // Public AJAX (for both logged-in and non-logged-in users)
        add_action('wp_ajax_get_products', [$ajaxController, 'getProducts']);
        add_action('wp_ajax_nopriv_get_products', [$ajaxController, 'getProducts']);

        add_action('wp_ajax_submit_product', [$ajaxController, 'submitProduct']);
        add_action('wp_ajax_nopriv_submit_product', [$ajaxController, 'submitProduct']);

        // Admin-only AJAX
        add_action('wp_ajax_admin_get_analytics', [$ajaxController, 'getAnalytics']);
        add_action('wp_ajax_admin_export_data', [$ajaxController, 'exportData']);
    }

    private function registerCronJobs(): void
    {
        // Schedule cleanup job
        if (!wp_next_scheduled('my_awesome_plugin_cleanup')) {
            wp_schedule_event(time(), 'daily', 'my_awesome_plugin_cleanup');
        }

        // Schedule analytics job
        if (!wp_next_scheduled('my_awesome_plugin_analytics')) {
            wp_schedule_event(time(), 'hourly', 'my_awesome_plugin_analytics');
        }

        // Register cron callbacks
        add_action('my_awesome_plugin_cleanup', [$this, 'runCleanup']);
        add_action('my_awesome_plugin_analytics', [$this, 'runAnalytics']);
    }

    private function registerCapabilities(): void
    {
        add_action('init', function () {
            $admin = get_role('administrator');
            $editor = get_role('editor');

            $capabilities = [
                'manage_awesome_products',
                'edit_awesome_products',
                'delete_awesome_products',
                'view_awesome_analytics',
            ];

            foreach ($capabilities as $cap) {
                if ($admin) {
                    $admin->add_cap($cap);
                }
                if ($editor) {
                    $editor->add_cap($cap);
                }
            }
        });
    }

    private function setupCustomFields(): void
    {
        // ACF integration if available
        if (function_exists('acf_add_local_field_group')) {
            add_action('acf/init', [$this, 'registerAcfFields']);
        }

        // Meta box integration
        add_action('add_meta_boxes', [$this, 'addCustomMetaBoxes']);
        add_action('save_post', [$this, 'saveCustomMetaBoxes']);
    }

    private function registerWidgets(): void
    {
        add_action('widgets_init', function () {
            register_widget('MyAwesomePlugin\\Widgets\\ProductsWidget');
            register_widget('MyAwesomePlugin\\Widgets\\StatsWidget');
        });
    }

    public function registerAcfFields(): void
    {
        acf_add_local_field_group([
            'key' => 'group_awesome_product_fields',
            'title' => 'Product Details',
            'fields' => [
                [
                    'key' => 'field_product_price',
                    'label' => 'Price',
                    'name' => 'product_price',
                    'type' => 'number',
                    'prefix' => '$',
                    'required' => 1,
                ],
                [
                    'key' => 'field_product_sku',
                    'label' => 'SKU',
                    'name' => 'product_sku',
                    'type' => 'text',
                ],
                [
                    'key' => 'field_product_gallery',
                    'label' => 'Gallery',
                    'name' => 'product_gallery',
                    'type' => 'gallery',
                ],
            ],
            'location' => [
                [
                    [
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'awesome_product',
                    ],
                ],
            ],
        ]);
    }

    public function runCleanup(): void
    {
        // Clean up expired data, optimize database, etc.
        $service = $this->app->make('MyAwesomePlugin\\Services\\CleanupService');
        $service->runDailyCleanup();
    }

    public function runAnalytics(): void
    {
        // Generate analytics data
        $service = $this->app->make('MyAwesomePlugin\\Services\\AnalyticsService');
        $service->generateHourlyStats();
    }
}
```

## WordPress-Integrated Models

### Extending WordPress Post Model

```php
<?php
// src/Models/Product.php

namespace MyAwesomePlugin\Models;

use AvelPress\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'posts';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'post_title',
        'post_content',
        'post_status',
        'post_type',
    ];

    protected $casts = [
        'post_date' => 'datetime',
        'post_modified' => 'datetime',
    ];

    /**
     * Get product price from meta
     */
    public function getPriceAttribute()
    {
        return get_post_meta($this->ID, 'product_price', true);
    }

    /**
     * Set product price meta
     */
    public function setPriceAttribute($value)
    {
        update_post_meta($this->ID, 'product_price', $value);
    }

    /**
     * Get product SKU
     */
    public function getSkuAttribute()
    {
        return get_post_meta($this->ID, 'product_sku', true);
    }

    /**
     * Set product SKU
     */
    public function setSkuAttribute($value)
    {
        update_post_meta($this->ID, 'product_sku', $value);
    }

    /**
     * Get product categories
     */
    public function getCategoriesAttribute()
    {
        return wp_get_post_terms($this->ID, 'product_category');
    }

    /**
     * Get product featured image
     */
    public function getFeaturedImageAttribute()
    {
        $image_id = get_post_thumbnail_id($this->ID);
        if ($image_id) {
            return wp_get_attachment_image_src($image_id, 'full');
        }
        return null;
    }

    /**
     * Get product gallery
     */
    public function getGalleryAttribute()
    {
        $gallery_ids = get_post_meta($this->ID, 'product_gallery', true);
        if ($gallery_ids) {
            $images = [];
            foreach (explode(',', $gallery_ids) as $id) {
                $images[] = wp_get_attachment_image_src($id, 'full');
            }
            return $images;
        }
        return [];
    }

    /**
     * Create a new product
     */
    public static function createProduct(array $data): self
    {
        $post_id = wp_insert_post([
            'post_title' => $data['title'],
            'post_content' => $data['content'] ?? '',
            'post_status' => $data['status'] ?? 'publish',
            'post_type' => 'awesome_product',
        ]);

        if (is_wp_error($post_id)) {
            throw new \Exception('Failed to create product: ' . $post_id->get_error_message());
        }

        $product = self::find($post_id);

        // Set meta fields
        if (isset($data['price'])) {
            $product->price = $data['price'];
        }

        if (isset($data['sku'])) {
            $product->sku = $data['sku'];
        }

        // Set categories
        if (isset($data['categories'])) {
            wp_set_post_terms($post_id, $data['categories'], 'product_category');
        }

        // Set featured image
        if (isset($data['featured_image'])) {
            set_post_thumbnail($post_id, $data['featured_image']);
        }

        return $product;
    }

    /**
     * Update product
     */
    public function updateProduct(array $data): bool
    {
        $update_data = [];

        if (isset($data['title'])) {
            $update_data['ID'] = $this->ID;
            $update_data['post_title'] = $data['title'];
        }

        if (isset($data['content'])) {
            $update_data['post_content'] = $data['content'];
        }

        if (isset($data['status'])) {
            $update_data['post_status'] = $data['status'];
        }

        if (!empty($update_data)) {
            $result = wp_update_post($update_data);
            if (is_wp_error($result)) {
                return false;
            }
        }

        // Update meta fields
        if (isset($data['price'])) {
            $this->price = $data['price'];
        }

        if (isset($data['sku'])) {
            $this->sku = $data['sku'];
        }

        // Update categories
        if (isset($data['categories'])) {
            wp_set_post_terms($this->ID, $data['categories'], 'product_category');
        }

        return true;
    }

    /**
     * Delete product
     */
    public function deleteProduct($force_delete = false): bool
    {
        $result = wp_delete_post($this->ID, $force_delete);
        return $result !== false;
    }
}
```

### WordPress User Model

```php
<?php
// src/Models/User.php

namespace MyAwesomePlugin\Models;

use AvelPress\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'user_login',
        'user_email',
        'user_nicename',
        'display_name',
    ];

    /**
     * Get user meta value
     */
    public function getMeta($key, $single = true)
    {
        return get_user_meta($this->ID, $key, $single);
    }

    /**
     * Set user meta value
     */
    public function setMeta($key, $value)
    {
        return update_user_meta($this->ID, $key, $value);
    }

    /**
     * Get user roles
     */
    public function getRolesAttribute()
    {
        $user = get_userdata($this->ID);
        return $user ? $user->roles : [];
    }

    /**
     * Check if user has capability
     */
    public function can($capability): bool
    {
        return user_can($this->ID, $capability);
    }

    /**
     * Get user's products
     */
    public function products()
    {
        return Product::where('post_author', $this->ID);
    }
}
```

## AJAX Controllers

### AJAX Handler

```php
<?php
// src/Controllers/AjaxController.php

namespace MyAwesomePlugin\Controllers;

use AvelPress\Routing\Controller;
use MyAwesomePlugin\Models\Product;
use MyAwesomePlugin\Http\Requests\ProductRequest;

class AjaxController extends Controller
{
    public function getProducts()
    {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'my_awesome_plugin_nonce')) {
            wp_die('Security check failed');
        }

        $page = intval($_POST['page'] ?? 1);
        $per_page = intval($_POST['per_page'] ?? 12);
        $category = sanitize_text_field($_POST['category'] ?? '');

        $query = Product::products();

        if ($category) {
            $query->whereHas('categories', function ($q) use ($category) {
                $q->where('slug', $category);
            });
        }

        $products = $query->paginate($per_page, $page);

        wp_send_json_success([
            'products' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'total_pages' => $products->lastPage(),
                'total_items' => $products->total(),
            ],
        ]);
    }

    public function submitProduct(ProductRequest $request)
    {
        // Check user permissions
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
        }

        try {
            $product = Product::createProduct($request->validated());
            
            wp_send_json_success([
                'message' => 'Product created successfully',
                'product' => $product,
            ]);
        } catch (\Exception $e) {
            wp_send_json_error('Failed to create product: ' . $e->getMessage());
        }
    }

    public function getAnalytics()
    {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }

        $analytics = [
            'total_products' => Product::products()->count(),
            'published_products' => Product::products()->where('post_status', 'publish')->count(),
            'draft_products' => Product::products()->where('post_status', 'draft')->count(),
            'recent_activity' => $this->getRecentActivity(),
        ];

        wp_send_json_success($analytics);
    }

    public function exportData()
    {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }

        $format = sanitize_text_field($_POST['format'] ?? 'csv');
        
        try {
            $exporter = $this->app->make('MyAwesomePlugin\\Services\\ExportService');
            $file_url = $exporter->exportProducts($format);
            
            wp_send_json_success([
                'download_url' => $file_url,
                'message' => 'Export completed successfully',
            ]);
        } catch (\Exception $e) {
            wp_send_json_error('Export failed: ' . $e->getMessage());
        }
    }

    private function getRecentActivity(): array
    {
        return Product::products()
            ->orderBy('post_modified', 'desc')
            ->limit(5)
            ->get(['ID', 'post_title', 'post_modified'])
            ->toArray();
    }
}
```

## WordPress Hooks Integration

### Hook Management

```php
<?php
// src/Services/HookService.php

namespace MyAwesomePlugin\Services;

class HookService
{
    public function __construct()
    {
        $this->registerHooks();
    }

    private function registerHooks(): void
    {
        // Content filters
        add_filter('the_content', [$this, 'enhanceProductContent'], 20);
        add_filter('the_excerpt', [$this, 'enhanceProductExcerpt'], 20);

        // Post hooks
        add_action('save_post', [$this, 'onPostSave'], 10, 2);
        add_action('delete_post', [$this, 'onPostDelete']);

        // User hooks
        add_action('user_register', [$this, 'onUserRegister']);
        add_action('profile_update', [$this, 'onUserUpdate'], 10, 2);

        // Comment hooks
        add_action('comment_post', [$this, 'onCommentPost'], 10, 3);

        // Admin hooks
        add_action('admin_notices', [$this, 'showAdminNotices']);
        add_filter('plugin_action_links_' . plugin_basename(MY_AWESOME_PLUGIN_FILE), [$this, 'addPluginActionLinks']);

        // Frontend hooks
        add_action('wp_head', [$this, 'addFrontendMeta']);
        add_action('wp_footer', [$this, 'addFrontendScripts']);

        // WooCommerce integration if available
        if (class_exists('WooCommerce')) {
            $this->registerWooCommerceHooks();
        }
    }

    public function enhanceProductContent($content): string
    {
        if (is_singular('awesome_product')) {
            $product = Product::find(get_the_ID());
            
            if ($product && $product->price) {
                $price_html = '<div class="product-price">Price: $' . number_format($product->price, 2) . '</div>';
                $content = $price_html . $content;
            }
        }

        return $content;
    }

    public function enhanceProductExcerpt($excerpt): string
    {
        if (get_post_type() === 'awesome_product') {
            $product = Product::find(get_the_ID());
            
            if ($product && $product->sku) {
                $excerpt .= ' <span class="product-sku">SKU: ' . esc_html($product->sku) . '</span>';
            }
        }

        return $excerpt;
    }

    public function onPostSave($post_id, $post): void
    {
        if ($post->post_type === 'awesome_product') {
            // Clear product cache
            wp_cache_delete("product_{$post_id}", 'my_awesome_plugin');
            
            // Trigger custom action
            do_action('awesome_product_saved', $post_id, $post);
        }
    }

    public function onPostDelete($post_id): void
    {
        $post = get_post($post_id);
        if ($post && $post->post_type === 'awesome_product') {
            // Clean up associated data
            delete_post_meta($post_id, 'product_price');
            delete_post_meta($post_id, 'product_sku');
            
            // Trigger custom action
            do_action('awesome_product_deleted', $post_id);
        }
    }

    public function onUserRegister($user_id): void
    {
        // Set default user meta for our plugin
        update_user_meta($user_id, 'awesome_plugin_registered', current_time('mysql'));
        update_user_meta($user_id, 'awesome_plugin_preferences', [
            'email_notifications' => true,
            'product_alerts' => false,
        ]);
    }

    public function onUserUpdate($user_id, $old_user_data): void
    {
        // Log user updates
        $log_entry = [
            'user_id' => $user_id,
            'timestamp' => current_time('mysql'),
            'changes' => $this->detectUserChanges($user_id, $old_user_data),
        ];
        
        // Store in custom table or option
        $this->logUserActivity($log_entry);
    }

    public function onCommentPost($comment_id, $approved, $commentdata): void
    {
        if ($approved && get_post_type($commentdata['comment_post_ID']) === 'awesome_product') {
            // Send notification to product author
            $this->notifyProductAuthor($commentdata['comment_post_ID'], $comment_id);
        }
    }

    public function showAdminNotices(): void
    {
        // Show update notices, warnings, etc.
        $notices = get_transient('my_awesome_plugin_admin_notices');
        
        if ($notices) {
            foreach ($notices as $notice) {
                printf(
                    '<div class="notice notice-%s is-dismissible"><p>%s</p></div>',
                    esc_attr($notice['type']),
                    wp_kses_post($notice['message'])
                );
            }
            delete_transient('my_awesome_plugin_admin_notices');
        }
    }

    public function addPluginActionLinks($links): array
    {
        $plugin_links = [
            '<a href="' . admin_url('admin.php?page=my-awesome-plugin-settings') . '">' . __('Settings', 'my-awesome-plugin') . '</a>',
            '<a href="https://example.com/docs" target="_blank">' . __('Documentation', 'my-awesome-plugin') . '</a>',
        ];

        return array_merge($plugin_links, $links);
    }

    public function addFrontendMeta(): void
    {
        if (is_singular('awesome_product')) {
            $product = Product::find(get_the_ID());
            
            if ($product) {
                echo '<meta name="product-price" content="' . esc_attr($product->price) . '">' . "\n";
                echo '<meta name="product-sku" content="' . esc_attr($product->sku) . '">' . "\n";
            }
        }
    }

    public function addFrontendScripts(): void
    {
        if (is_singular('awesome_product')) {
            echo '<script>console.log("Product page loaded");</script>' . "\n";
        }
    }

    private function registerWooCommerceHooks(): void
    {
        add_action('woocommerce_product_meta_end', [$this, 'addWooCommerceProductMeta']);
        add_filter('woocommerce_get_price_html', [$this, 'modifyWooCommercePriceDisplay'], 10, 2);
    }

    public function addWooCommerceProductMeta(): void
    {
        // Add custom meta to WooCommerce products
        echo '<div class="awesome-plugin-woo-meta">Enhanced by My Awesome Plugin</div>';
    }

    public function modifyWooCommercePriceDisplay($price, $product): string
    {
        // Modify WooCommerce price display if needed
        return $price;
    }

    private function detectUserChanges($user_id, $old_user_data): array
    {
        $current_user = get_userdata($user_id);
        $changes = [];

        $fields_to_check = ['user_email', 'display_name', 'user_nicename'];
        
        foreach ($fields_to_check as $field) {
            if ($current_user->{$field} !== $old_user_data->{$field}) {
                $changes[$field] = [
                    'old' => $old_user_data->{$field},
                    'new' => $current_user->{$field},
                ];
            }
        }

        return $changes;
    }

    private function logUserActivity($log_entry): void
    {
        // Implementation depends on your logging strategy
        // Could be custom table, WordPress option, or external service
    }

    private function notifyProductAuthor($post_id, $comment_id): void
    {
        $post = get_post($post_id);
        $comment = get_comment($comment_id);
        $author = get_userdata($post->post_author);

        if ($author) {
            wp_mail(
                $author->user_email,
                sprintf(__('New comment on your product: %s', 'my-awesome-plugin'), $post->post_title),
                sprintf(__('A new comment has been posted on your product "%s" by %s.', 'my-awesome-plugin'), $post->post_title, $comment->comment_author)
            );
        }
    }
}
```

This comprehensive WordPress integration guide demonstrates how AvelPress seamlessly integrates with WordPress while providing modern development patterns. The framework maintains WordPress compatibility while offering structured, testable, and maintainable code organization.
