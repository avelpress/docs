# WordPress Integration

AvelPress models are designed to work seamlessly with WordPress, allowing you to integrate your custom models with WordPress users, posts, meta data, and other WordPress features.

## User Model Integration

### Linking to WordPress Users

```php
class User extends Model
{
    protected $fillable = [
        'name', 'email', 'wp_user_id', 'status'
    ];

    // Link to WordPress user
    public function wordpressUser()
    {
        return get_user_by('id', $this->wp_user_id);
    }

    // WordPress capabilities
    public function can($capability)
    {
        $wp_user = $this->wordpressUser();
        return $wp_user ? user_can($wp_user, $capability) : false;
    }

    // WordPress roles
    public function hasRole($role)
    {
        $wp_user = $this->wordpressUser();
        return $wp_user ? in_array($role, $wp_user->roles) : false;
    }

    // WordPress avatar
    public function getWpAvatarAttribute()
    {
        return get_avatar_url($this->email, 80);
    }

    // Check if user is logged in
    public function isCurrentUser()
    {
        return $this->wp_user_id && get_current_user_id() === $this->wp_user_id;
    }
}
```

### WordPress User Meta

```php
class User extends Model
{
    // Get WordPress meta
    public function getMeta($key, $single = true)
    {
        if ($this->wp_user_id) {
            return get_user_meta($this->wp_user_id, $key, $single);
        }
        return $single ? null : [];
    }

    // Update WordPress meta
    public function updateMeta($key, $value)
    {
        if ($this->wp_user_id) {
            return update_user_meta($this->wp_user_id, $key, $value);
        }
        return false;
    }

    // Delete WordPress meta
    public function deleteMeta($key, $value = '')
    {
        if ($this->wp_user_id) {
            return delete_user_meta($this->wp_user_id, $key, $value);
        }
        return false;
    }

    // Get all meta
    public function getAllMeta()
    {
        if ($this->wp_user_id) {
            return get_user_meta($this->wp_user_id);
        }
        return [];
    }
}
```

### Creating WordPress Users

```php
class User extends Model
{
    protected static function boot()
    {
        parent::boot();

        static::created(function ($user) {
            // Create corresponding WordPress user
            $wp_user_id = wp_create_user(
                $user->email, // username (using email)
                wp_generate_password(), // random password
                $user->email // email
            );

            if (!is_wp_error($wp_user_id)) {
                $user->update(['wp_user_id' => $wp_user_id]);
                
                // Set additional user meta
                update_user_meta($wp_user_id, 'first_name', $user->first_name);
                update_user_meta($wp_user_id, 'last_name', $user->last_name);
                update_user_meta($wp_user_id, 'display_name', $user->name);
                update_user_meta($wp_user_id, 'custom_user_id', $user->id);

                // Set user role
                $wp_user = new WP_User($wp_user_id);
                $wp_user->set_role('subscriber');
                
                // Send notification email
                wp_new_user_notification($wp_user_id, null, 'user');
            }
        });

        static::deleting(function ($user) {
            // Delete WordPress user when model is deleted
            if ($user->wp_user_id) {
                require_once(ABSPATH . 'wp-admin/includes/user.php');
                wp_delete_user($user->wp_user_id);
            }
        });
    }
}
```

## Post Model Integration

### Linking to WordPress Posts

```php
class Post extends Model
{
    protected $fillable = [
        'title', 'content', 'status', 'wp_post_id', 'user_id'
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    // Link to WordPress post
    public function wordpressPost()
    {
        if ($this->wp_post_id) {
            return get_post($this->wp_post_id);
        }
        return null;
    }

    // WordPress permalink
    public function getPermalinkAttribute()
    {
        if ($this->wp_post_id) {
            return get_permalink($this->wp_post_id);
        }
        return null;
    }

    // WordPress excerpt
    public function getExcerptAttribute()
    {
        $wp_post = $this->wordpressPost();
        if ($wp_post) {
            return wp_trim_excerpt('', $wp_post);
        }
        return null;
    }

    // Featured image
    public function getFeaturedImageAttribute()
    {
        if ($this->wp_post_id) {
            $attachment_id = get_post_thumbnail_id($this->wp_post_id);
            return $attachment_id ? wp_get_attachment_image_url($attachment_id, 'full') : null;
        }
        return null;
    }
}
```

### WordPress Post Meta

```php
class Post extends Model
{
    // Get WordPress post meta
    public function getMeta($key, $single = true)
    {
        if ($this->wp_post_id) {
            return get_post_meta($this->wp_post_id, $key, $single);
        }
        return $single ? null : [];
    }

    // Update WordPress post meta
    public function updateMeta($key, $value)
    {
        if ($this->wp_post_id) {
            return update_post_meta($this->wp_post_id, $key, $value);
        }
        return false;
    }

    // Delete WordPress post meta
    public function deleteMeta($key, $value = '')
    {
        if ($this->wp_post_id) {
            return delete_post_meta($this->wp_post_id, $key, $value);
        }
        return false;
    }

    // Get all meta
    public function getAllMeta()
    {
        if ($this->wp_post_id) {
            return get_post_meta($this->wp_post_id);
        }
        return [];
    }

    // WordPress categories
    public function getWpCategoriesAttribute()
    {
        if ($this->wp_post_id) {
            return wp_get_post_categories($this->wp_post_id, ['fields' => 'all']);
        }
        return [];
    }

    // WordPress tags
    public function getWpTagsAttribute()
    {
        if ($this->wp_post_id) {
            return wp_get_post_tags($this->wp_post_id);
        }
        return [];
    }
}
```

### Creating WordPress Posts

```php
class Post extends Model
{
    protected static function boot()
    {
        parent::boot();

        static::created(function ($post) {
            // Create corresponding WordPress post
            $wp_post_id = wp_insert_post([
                'post_title' => $post->title,
                'post_content' => $post->content,
                'post_status' => $post->status,
                'post_author' => $post->user->wp_user_id ?? 1,
                'post_type' => 'post',
                'meta_input' => [
                    'custom_post_id' => $post->id,
                ]
            ]);

            if (!is_wp_error($wp_post_id)) {
                $post->update(['wp_post_id' => $wp_post_id]);
            }
        });

        static::updated(function ($post) {
            // Sync with WordPress post
            if ($post->wp_post_id && $post->isDirty(['title', 'content', 'status'])) {
                wp_update_post([
                    'ID' => $post->wp_post_id,
                    'post_title' => $post->title,
                    'post_content' => $post->content,
                    'post_status' => $post->status,
                ]);
            }
        });

        static::deleting(function ($post) {
            // Delete WordPress post
            if ($post->wp_post_id) {
                wp_delete_post($post->wp_post_id, true);
            }
        });
    }
}
```

## Custom Post Types

### Working with Custom Post Types

```php
class Product extends Model
{
    protected $fillable = [
        'name', 'description', 'price', 'sku', 'wp_post_id'
    ];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($product) {
            // Create custom post type
            $wp_post_id = wp_insert_post([
                'post_title' => $product->name,
                'post_content' => $product->description,
                'post_status' => 'publish',
                'post_type' => 'product', // Custom post type
                'meta_input' => [
                    'price' => $product->price,
                    'sku' => $product->sku,
                    'product_model_id' => $product->id,
                ]
            ]);

            if (!is_wp_error($wp_post_id)) {
                $product->update(['wp_post_id' => $wp_post_id]);
            }
        });
    }

    // Get WordPress custom post
    public function wordpressProduct()
    {
        if ($this->wp_post_id) {
            return get_post($this->wp_post_id);
        }
        return null;
    }

    // Product permalink
    public function getPermalinkAttribute()
    {
        if ($this->wp_post_id) {
            return get_permalink($this->wp_post_id);
        }
        return null;
    }
}
```

## WooCommerce Integration

### WooCommerce Product Integration

```php
class Product extends Model
{
    protected $fillable = [
        'name', 'description', 'price', 'sku', 'wc_product_id'
    ];

    // Get WooCommerce product
    public function woocommerceProduct()
    {
        if ($this->wc_product_id && function_exists('wc_get_product')) {
            return wc_get_product($this->wc_product_id);
        }
        return null;
    }

    // Create WooCommerce product
    public function createWooCommerceProduct()
    {
        if (!function_exists('wc_get_product')) {
            return false;
        }

        $product = new \WC_Product_Simple();
        $product->set_name($this->name);
        $product->set_description($this->description);
        $product->set_regular_price($this->price);
        $product->set_sku($this->sku);
        $product->set_status('publish');
        
        $wc_product_id = $product->save();
        
        if ($wc_product_id) {
            $this->update(['wc_product_id' => $wc_product_id]);
            
            // Add custom meta
            update_post_meta($wc_product_id, '_custom_product_id', $this->id);
        }

        return $wc_product_id;
    }

    // Sync price with WooCommerce
    protected static function boot()
    {
        parent::boot();

        static::updated(function ($product) {
            if ($product->wc_product_id && $product->isDirty('price')) {
                $wc_product = wc_get_product($product->wc_product_id);
                if ($wc_product) {
                    $wc_product->set_regular_price($product->price);
                    $wc_product->save();
                }
            }
        });
    }
}
```

## Option and Transient Integration

### WordPress Options

```php
class Settings extends Model
{
    protected $fillable = ['key', 'value', 'autoload'];

    // Sync with WordPress options
    protected static function boot()
    {
        parent::boot();

        static::created(function ($setting) {
            update_option($setting->key, $setting->value, $setting->autoload);
        });

        static::updated(function ($setting) {
            if ($setting->isDirty('value')) {
                update_option($setting->key, $setting->value, $setting->autoload);
            }
        });

        static::deleted(function ($setting) {
            delete_option($setting->key);
        });
    }

    // Get option value
    public static function getOption($key, $default = null)
    {
        return get_option($key, $default);
    }

    // Update option
    public static function updateOption($key, $value, $autoload = null)
    {
        $setting = static::firstOrCreate(['key' => $key]);
        $setting->update([
            'value' => $value,
            'autoload' => $autoload ?? $setting->autoload ?? true
        ]);
        
        return update_option($key, $value, $autoload);
    }
}
```

### WordPress Transients

```php
class Cache extends Model
{
    protected $fillable = ['key', 'value', 'expiration'];

    protected function casts(): array
    {
        return [
            'value' => 'array',
            'expiration' => 'datetime',
        ];
    }

    // Set transient
    public static function setTransient($key, $value, $expiration = 3600)
    {
        $cache = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'expiration' => now()->addSeconds($expiration)
            ]
        );

        set_transient($key, $value, $expiration);
        
        return $cache;
    }

    // Get transient
    public static function getTransient($key)
    {
        return get_transient($key);
    }

    // Delete expired transients
    public static function cleanExpired()
    {
        $expired = static::where('expiration', '<', now())->get();
        
        foreach ($expired as $cache) {
            delete_transient($cache->key);
            $cache->delete();
        }
    }
}
```

## WordPress Hooks Integration

### Model Events with WordPress Hooks

```php
class Post extends Model
{
    protected static function boot()
    {
        parent::boot();

        static::created(function ($post) {
            // Fire WordPress action
            do_action('avelpress_post_created', $post);
        });

        static::updated(function ($post) {
            // Fire WordPress action with old and new data
            do_action('avelpress_post_updated', $post, $post->getOriginal());
        });

        static::deleted(function ($post) {
            // Fire WordPress action
            do_action('avelpress_post_deleted', $post);
        });
    }

    // Allow WordPress filters to modify data
    public function getFilteredContentAttribute()
    {
        return apply_filters('avelpress_post_content', $this->content, $this);
    }
}
```

### WordPress Action and Filter Helpers

```php
class User extends Model
{
    // Apply WordPress filters to user data
    public function toWordPressArray()
    {
        $data = $this->toArray();
        return apply_filters('avelpress_user_data', $data, $this);
    }

    // Hook into WordPress login
    public function onWordPressLogin()
    {
        do_action('avelpress_user_login', $this);
        
        // Update last login
        $this->update(['last_login_at' => now()]);
    }

    // Hook into WordPress logout
    public function onWordPressLogout()
    {
        do_action('avelpress_user_logout', $this);
    }
}
```

## WordPress Query Integration

### Custom WP_Query Integration

```php
class Post extends Model
{
    // Query WordPress posts and sync with models
    public static function syncFromWordPress($args = [])
    {
        $default_args = [
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'meta_query' => [
                [
                    'key' => 'synced_with_model',
                    'compare' => 'NOT EXISTS'
                ]
            ]
        ];

        $args = array_merge($default_args, $args);
        $wp_posts = get_posts($args);

        foreach ($wp_posts as $wp_post) {
            $post = static::firstOrCreate(
                ['wp_post_id' => $wp_post->ID],
                [
                    'title' => $wp_post->post_title,
                    'content' => $wp_post->post_content,
                    'status' => $wp_post->post_status,
                    'published_at' => $wp_post->post_date,
                ]
            );

            // Mark as synced
            update_post_meta($wp_post->ID, 'synced_with_model', true);
        }
    }

    // Get related WordPress posts
    public static function getRelatedWordPressPosts($post_id, $limit = 5)
    {
        $post = static::find($post_id);
        if (!$post || !$post->wp_post_id) {
            return collect();
        }

        // Use WordPress functions to get related posts
        $related_ids = get_post_meta($post->wp_post_id, 'related_posts', true);
        
        if ($related_ids) {
            return static::whereIn('wp_post_id', $related_ids)
                ->limit($limit)
                ->get();
        }

        // Fallback to same category posts
        $categories = wp_get_post_categories($post->wp_post_id);
        if ($categories) {
            $related_wp_posts = get_posts([
                'category__in' => $categories,
                'post__not_in' => [$post->wp_post_id],
                'posts_per_page' => $limit,
            ]);

            $related_ids = array_column($related_wp_posts, 'ID');
            return static::whereIn('wp_post_id', $related_ids)->get();
        }

        return collect();
    }
}
```

## Performance Optimization

### Caching WordPress Data

```php
class User extends Model
{
    protected $wpDataCache = [];

    public function getWordPressUserCached()
    {
        if (!isset($this->wpDataCache['wp_user'])) {
            $this->wpDataCache['wp_user'] = get_user_by('id', $this->wp_user_id);
        }
        return $this->wpDataCache['wp_user'];
    }

    public function getMetaCached($key, $single = true)
    {
        $cache_key = "meta_{$key}_{$single}";
        
        if (!isset($this->wpDataCache[$cache_key])) {
            $this->wpDataCache[$cache_key] = get_user_meta($this->wp_user_id, $key, $single);
        }
        
        return $this->wpDataCache[$cache_key];
    }

    // Clear cache when model is updated
    protected static function boot()
    {
        parent::boot();

        static::updated(function ($user) {
            $user->wpDataCache = [];
            
            // Clear WordPress object cache
            if ($user->wp_user_id) {
                clean_user_cache($user->wp_user_id);
            }
        });
    }
}
```

### Batch WordPress Operations

```php
class Post extends Model
{
    // Batch create WordPress posts
    public static function batchCreateWordPressPosts($posts)
    {
        $wp_post_ids = [];
        
        foreach ($posts as $post) {
            if (!$post->wp_post_id) {
                $wp_post_id = wp_insert_post([
                    'post_title' => $post->title,
                    'post_content' => $post->content,
                    'post_status' => $post->status,
                ], true);
                
                if (!is_wp_error($wp_post_id)) {
                    $wp_post_ids[$post->id] = $wp_post_id;
                }
            }
        }

        // Batch update models
        foreach ($wp_post_ids as $model_id => $wp_post_id) {
            static::where('id', $model_id)->update(['wp_post_id' => $wp_post_id]);
        }

        return $wp_post_ids;
    }
}
```
