# Models

Models in AvelPress are classes that represent tables in your database. They provide an elegant and simple ActiveRecord implementation for working with your database, following Laravel's Eloquent conventions while being optimized for WordPress.

## Introduction

Every model class corresponds to a database table. Models allow you to query, insert, update, and delete records from their corresponding tables using an expressive, fluent syntax.

## Creating Models

### Using the CLI

The easiest way to create a model is using the AvelPress CLI:

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

The CLI will automatically:
- Create the model file with proper namespace
- Set up fillable attributes if provided
- Enable timestamps if specified
- Add table prefix if specified
- Use proper WordPress coding standards
- Place the model in the correct directory structure

### Manual Model Creation

You can also create models manually by extending the base `Model` class:

```php
<?php

namespace App\Models;

use AvelPress\Database\Eloquent\Model;

defined( 'ABSPATH' ) || exit;

class User extends Model {
    protected $table = 'users';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'email',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
```

### Model Properties

#### Table Name

By convention, models use the pluralized, snake_case version of the class name as the table name:

```php
class User extends Model
{
    // Uses table: users (auto-generated)
}

class ProductCategory extends Model
{
    // Uses table: product_categories (auto-generated)
}

// Custom table name
class User extends Model
{
    protected $table = 'custom_users';
}
```

#### Table Prefix

If your tables use a custom prefix, you can specify it:

```php
class User extends Model
{
    protected $prefix = 'custom_';
}
```

#### Primary Key

Models assume the primary key is named `id` and is an auto-incrementing integer:

```php
class User extends Model
{
    // Custom primary key
    protected $primaryKey = 'user_id';

    // Non-incrementing primary key
    public $incrementing = false;

    // String primary key
    protected $keyType = 'string';
}
```

#### Table Prefix

Set a custom table prefix for your model:

```php
class User extends Model
{
    protected $prefix = 'my_plugin_';
    // Table name will be: my_plugin_users
}
```

#### Timestamps

Enable automatic timestamp management:

```php
class User extends Model
{
    public $timestamps = true;
    // Automatically manages created_at and updated_at
}

// Custom timestamp columns
class User extends Model
{
    public $timestamps = true;
    protected $createdAtColumn = 'created_on';
    protected $updatedAtColumn = 'modified_on';
}
```

## Mass Assignment

### Fillable Attributes

Define which attributes can be mass-assigned for security:

```php
class User extends Model
{
    protected $fillable = [
        'name',
        'email',
        'status',
        'bio',
    ];
}

// Mass assignment works
$user = User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'status' => 'active'
]);
```

### Guarded Attributes

Alternatively, specify which attributes should be protected:

```php
class User extends Model
{
    protected $guarded = [
        'id',
        'password',
        'admin_level',
    ];
    // All other attributes are fillable
}
```

## Retrieving Models

### All Records

```php
// Get all users
$users = User::all();

// Get all with specific columns
$users = User::all(['name', 'email']);
```

### Finding Records

```php
// Find by primary key
$user = User::find(1);

// Find multiple records
$users = User::find([1, 2, 3]);

// Find or fail (throws exception)
$user = User::findOrFail(1);

// First record matching criteria
$user = User::where('email', 'john@example.com')->first();

// First or fail
$user = User::where('active', true)->firstOrFail();
```

### Query Conditions

```php
// Basic where
$activeUsers = User::where('status', 'active')->get();

// Multiple conditions
$users = User::where('status', 'active')
    ->where('age', '>', 18)
    ->get();

// Or conditions
$users = User::where('status', 'active')
    ->orWhere('status', 'premium')
    ->get();

// Where in
$users = User::whereIn('status', ['active', 'premium'])->get();

// Date queries
$recentUsers = User::where('created_at', '>', '2024-01-01')->get();

// Null checks
$unverifiedUsers = User::whereNull('email_verified_at')->get();
```

### Ordering and Limiting

```php
// Order by
$users = User::orderBy('created_at', 'desc')->get();

// Multiple ordering
$users = User::orderBy('status')
    ->orderBy('name', 'asc')
    ->get();

// Limit and offset
$users = User::limit(10)->offset(20)->get();

// Latest and oldest
$latestUsers = User::latest()->get(); // Orders by created_at desc
$oldestUsers = User::oldest()->get(); // Orders by created_at asc
```

### Aggregates

```php
// Count
$count = User::count();
$activeCount = User::where('status', 'active')->count();

// Exists
$exists = User::where('email', 'john@example.com')->exists();

// Max, min, average, sum
$maxAge = User::max('age');
$minAge = User::min('age');
$avgAge = User::avg('age');
$totalPoints = User::sum('points');
```

## Creating and Updating

### Creating Records

```php
// Method 1: New instance
$user = new User;
$user->name = 'John Doe';
$user->email = 'john@example.com';
$user->save();

// Method 2: Mass assignment
$user = User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'status' => 'active'
]);

// Method 3: First or create
$user = User::firstOrCreate(
    ['email' => 'john@example.com'], // Search criteria
    ['name' => 'John Doe', 'status' => 'active'] // Additional data if creating
);

// Method 4: Update or create
$user = User::updateOrCreate(
    ['email' => 'john@example.com'], // Search criteria  
    ['name' => 'John Smith', 'status' => 'active'] // Data to update/create
);
```

### Updating Records

```php
// Update single model
$user = User::find(1);
$user->name = 'Jane Doe';
$user->save();

// Mass update single model
$user->update(['name' => 'Jane Doe', 'status' => 'inactive']);

// Update multiple models
User::where('status', 'pending')
    ->update(['status' => 'active']);

// Increment/decrement
$user = User::find(1);
$user->increment('points'); // Increment by 1
$user->increment('points', 5); // Increment by 5
$user->decrement('points', 2); // Decrement by 2
```

### Bulk Operations

```php
// Insert multiple records
User::createMany([
    ['name' => 'John', 'email' => 'john@example.com'],
    ['name' => 'Jane', 'email' => 'jane@example.com'],
    ['name' => 'Bob', 'email' => 'bob@example.com']
]);
```

## Deleting Models

### Basic Deletion

```php
// Delete single model
$user = User::find(1);
$user->delete();

// Delete by ID
User::destroy(1);

// Delete multiple by ID
User::destroy([1, 2, 3]);

// Delete by query
User::where('status', 'inactive')->delete();
```

### Soft Deletes

Enable soft deletes to mark records as deleted without removing them:

```php
<?php

namespace App\Models;

use AvelPress\Database\Eloquent\Model;
use AvelPress\Database\Eloquent\SoftDeletes;

class User extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'email'];
}
```

```php
// Soft delete (sets deleted_at timestamp)
$user = User::find(1);
$user->delete();

// Include soft deleted models
$users = User::withTrashed()->get();

// Only soft deleted models
$deletedUsers = User::onlyTrashed()->get();

// Restore soft deleted model
$user = User::withTrashed()->find(1);
$user->restore();

// Force delete (permanent deletion)
$user->forceDelete();
```

## Relationships

### One to One

```php
class User extends Model
{
    public function profile()
    {
        return $this->hasOne(Profile::class);
    }
}

class Profile extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

// Usage
$user = User::find(1);
$profile = $user->profile;

$profile = Profile::find(1);
$user = $profile->user;
```

### One to Many

```php
class User extends Model
{
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}

class Post extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

// Usage
$user = User::find(1);
$posts = $user->posts;

foreach ($posts as $post) {
    echo $post->title;
}

// Create related model
$user = User::find(1);
$post = $user->posts()->create([
    'title' => 'New Post',
    'content' => 'Post content...'
]);
```

### Custom Foreign Keys

```php
class User extends Model
{
    public function posts()
    {
        return $this->hasMany(Post::class, 'author_id', 'id');
    }
}

class Profile extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
```

### Eager Loading

Prevent N+1 query problems by eager loading relationships:

```php
// Lazy loading (N+1 problem)
$users = User::all();
foreach ($users as $user) {
    echo $user->profile->bio; // Executes a query for each user
}

// Eager loading (efficient)
$users = User::with('profile')->get();
foreach ($users as $user) {
    echo $user->profile->bio; // Profile already loaded
}

// Multiple relationships
$users = User::with(['posts', 'profile'])->get();

// Nested relationships
$users = User::with('posts.comments')->get();

// Conditional eager loading
$users = User::with(['posts' => function ($query) {
    $query->where('status', 'published');
}])->get();
```

### Relationship Queries

```php
// Query through relationships
$users = User::whereHas('posts', function ($query) {
    $query->where('status', 'published');
})->get();

// Count related models
$users = User::withCount('posts')->get();
foreach ($users as $user) {
    echo $user->posts_count;
}

// Exists queries
$hasPublishedPosts = User::whereHas('posts', function ($query) {
    $query->where('status', 'published');
})->exists();
```

## Accessors and Mutators

### Accessors

Transform data when retrieving from the database:

```php
class User extends Model
{
    // Get first name from full name
    public function getFirstNameAttribute()
    {
        return explode(' ', $this->name)[0];
    }

    // Format email as lowercase
    public function getEmailAttribute($value)
    {
        return strtolower($value);
    }

    // Get full URL for avatar
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return wp_upload_dir()['baseurl'] . '/avatars/' . $this->avatar;
        }
        return get_avatar_url($this->email);
    }

    // WordPress integration
    public function getGravatarAttribute()
    {
        return get_avatar_url($this->email, 80);
    }
}
```

```php
$user = User::find(1);
echo $user->first_name; // Calls getFirstNameAttribute()
echo $user->avatar_url; // Calls getAvatarUrlAttribute()
echo $user->gravatar; // WordPress gravatar URL
```

### Mutators

Transform data when saving to the database:

```php
class User extends Model
{
    // Hash password automatically
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = wp_hash_password($value);
    }

    // Store email as lowercase
    public function setEmailAttribute($value)
    {
        $this->attributes['email'] = strtolower(trim($value));
    }

    // Auto-generate slug from title
    public function setTitleAttribute($value)
    {
        $this->attributes['title'] = $value;
        $this->attributes['slug'] = sanitize_title($value);
    }

    // WordPress meta integration
    public function setBioAttribute($value)
    {
        $this->attributes['bio'] = wp_kses_post($value);
    }
}
```

```php
$user = new User;
$user->password = 'plaintext'; // Automatically hashed
$user->email = 'JOHN@EXAMPLE.COM'; // Stored as lowercase
$user->title = 'My Blog Post'; // Generates slug automatically
$user->save();
```

### Attribute Casting

Cast attributes to specific types automatically:

```php
use AvelPress\Database\Eloquent\Casts\MoneyCast;
use AvelPress\Database\Eloquent\Casts\Attribute;

class Product extends Model
{
    protected function casts(): array
    {
        return [
            'price' => MoneyCast::class,
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    // Custom attribute casting
    protected function description(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ucfirst($value),
            set: fn ($value) => strtolower($value),
        );
    }
}
```

```php
$product = Product::find(1);
echo $product->price; // Automatically formatted as money
echo $product->is_featured; // Boolean value
echo $product->published_at->format('Y-m-d'); // Carbon instance
print_r($product->metadata); // Unserialized array
```

### Available Cast Types

```php
protected function casts(): array
{
    return [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'options' => 'array',
        'settings' => 'object',
        'published_at' => 'datetime',
        'metadata' => 'json',
        'amount' => MoneyCast::class, // Custom cast
    ];
}
```

## Model Events

Hook into model lifecycle events:

```php
class User extends Model
{
    protected static function boot()
    {
        parent::boot();

        // Before creating
        static::creating(function ($user) {
            $user->uuid = wp_generate_uuid4();
            
            // WordPress integration
            if (!$user->slug) {
                $user->slug = sanitize_title($user->name);
            }
        });

        // After creating
        static::created(function ($user) {
            // Send welcome email
            wp_mail($user->email, 'Welcome!', 'Welcome to our site!');
            
            // Create user meta
            add_user_meta($user->wp_user_id, 'custom_field', 'value');
        });

        // Before updating
        static::updating(function ($user) {
            error_log("User {$user->id} is being updated");
        });

        // After updating
        static::updated(function ($user) {
            // Clear WordPress cache
            wp_cache_delete("user_{$user->id}");
            clean_user_cache($user->wp_user_id);
        });

        // Before deleting
        static::deleting(function ($user) {
            // Delete related data
            $user->posts()->delete();
            
            // WordPress cleanup
            wp_delete_user($user->wp_user_id);
        });

        // After deleting
        static::deleted(function ($user) {
            // Log deletion
            error_log("User {$user->id} was deleted");
        });
    }
}
```

### Available Events

- `creating` - Before a new record is created
- `created` - After a new record is created
- `updating` - Before an existing record is updated
- `updated` - After an existing record is updated
- `saving` - Before creating or updating (both)
- `saved` - After creating or updating (both)
- `deleting` - Before a record is deleted
- `deleted` - After a record is deleted
- `restoring` - Before a soft-deleted record is restored
- `restored` - After a soft-deleted record is restored

## Serialization

### Array and JSON Conversion

```php
$user = User::find(1);

// Convert to array
$array = $user->toArray();

// Convert to JSON
$json = $user->toJson();

// When returning from API routes, automatic conversion happens
return $user; // Automatically converts to JSON for API responses
```

### Controlling Serialization

```php
class User extends Model
{
    // Hide sensitive attributes
    protected $hidden = ['password', 'remember_token', 'api_key'];

    // Or specify only visible attributes
    protected $visible = ['id', 'name', 'email', 'created_at'];

    // Append accessor attributes
    protected $appends = ['first_name', 'avatar_url', 'gravatar'];
}
```

```php
$user = User::find(1);
$array = $user->toArray();
// Will not include 'password' or 'remember_token'
// Will include 'first_name', 'avatar_url', and 'gravatar' from accessors
```

### Temporary Visibility Changes

```php
// Temporarily show hidden attributes
$user = User::find(1);
$array = $user->makeVisible(['password'])->toArray();

// Temporarily hide visible attributes
$array = $user->makeHidden(['email'])->toArray();
```

## WordPress Integration

### User Model Integration

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

    // WordPress meta
    public function getMeta($key, $single = true)
    {
        return get_user_meta($this->wp_user_id, $key, $single);
    }

    public function updateMeta($key, $value)
    {
        return update_user_meta($this->wp_user_id, $key, $value);
    }

    // WordPress avatar
    public function getWpAvatarAttribute()
    {
        return get_avatar_url($this->email, 80);
    }
}
```

### Post Model Integration

```php
class Post extends Model
{
    protected $fillable = [
        'title', 'content', 'status', 'wp_post_id'
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
        return get_post($this->wp_post_id);
    }

    // WordPress meta
    public function getMeta($key, $single = true)
    {
        return get_post_meta($this->wp_post_id, $key, $single);
    }

    public function updateMeta($key, $value)
    {
        return update_post_meta($this->wp_post_id, $key, $value);
    }

    // WordPress permalink
    public function getPermalinkAttribute()
    {
        return get_permalink($this->wp_post_id);
    }

    // WordPress excerpt
    public function getExcerptAttribute()
    {
        $wp_post = $this->wordpressPost();
        return $wp_post ? wp_trim_excerpt('', $wp_post) : null;
    }
}
```

## Advanced Features

### Pagination

```php
// Paginate results
$users = User::paginate(15); // 15 per page

// Custom pagination
$users = User::where('status', 'active')->paginate(10);

// Get pagination info
echo $users->currentPage();
echo $users->lastPage();
echo $users->total();
echo $users->count();

// Render pagination links (WordPress style)
echo $users->links();
```

### Collections

Models return Collection instances that provide additional methods:

```php
$users = User::where('status', 'active')->get();

// Collection methods
$names = $users->pluck('name');
$grouped = $users->groupBy('status');
$filtered = $users->filter(function ($user) {
    return $user->age > 18;
});

// Transform
$userEmails = $users->map(function ($user) {
    return strtolower($user->email);
});

// WordPress integration
$wpUserIds = $users->pluck('wp_user_id');
$capabilities = $users->map(function ($user) {
    return user_can($user->wp_user_id, 'edit_posts');
});
```

### Raw Queries

When you need more complex queries:

```php
use AvelPress\Facades\DB;

// Raw where clauses
$users = User::whereRaw('age > ? AND status = ?', [18, 'active'])->get();

// Raw selects
$stats = User::selectRaw('COUNT(*) as total, AVG(age) as avg_age')->first();

// Raw queries with DB facade
$results = DB::select('SELECT * FROM users WHERE custom_field = ?', ['value']);
```

## Complete Example

Here's a complete User model showcasing various features:

```php
<?php

namespace App\Models;

use AvelPress\Database\Eloquent\Model;
use AvelPress\Database\Eloquent\SoftDeletes;
use AvelPress\Database\Eloquent\Casts\Attribute;

class User extends Model
{
    use SoftDeletes;

    protected $table = 'users';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'email', 
        'status',
        'avatar',
        'wp_user_id',
        'bio',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'first_name',
        'avatar_url',
        'wp_avatar',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'settings' => 'array',
            'is_admin' => 'boolean',
        ];
    }

    // Accessors
    public function getFirstNameAttribute()
    {
        return explode(' ', $this->name)[0];
    }

    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return wp_upload_dir()['baseurl'] . '/avatars/' . $this->avatar;
        }
        return null;
    }

    public function getWpAvatarAttribute()
    {
        return get_avatar_url($this->email, 80);
    }

    // Mutators
    public function setEmailAttribute($value)
    {
        $this->attributes['email'] = strtolower(trim($value));
    }

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = wp_hash_password($value);
    }

    protected function bio(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => wp_kses_post($value),
            set: fn ($value) => wp_kses_post($value),
        );
    }

    // Relationships
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    // WordPress Integration
    public function wordpressUser()
    {
        return get_user_by('id', $this->wp_user_id);
    }

    public function can($capability)
    {
        $wp_user = $this->wordpressUser();
        return $wp_user ? user_can($wp_user, $capability) : false;
    }

    public function getMeta($key, $single = true)
    {
        return get_user_meta($this->wp_user_id, $key, $single);
    }

    public function updateMeta($key, $value)
    {
        return update_user_meta($this->wp_user_id, $key, $value);
    }

    // Model events
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            // Generate UUID if not provided
            if (!$user->uuid) {
                $user->uuid = wp_generate_uuid4();
            }

            // Generate slug from name
            if (!$user->slug) {
                $user->slug = sanitize_title($user->name);
            }
        });

        static::created(function ($user) {
            // Send welcome email
            wp_mail($user->email, 'Welcome!', 'Welcome to our application!');

            // Create default profile
            $user->profile()->create([
                'bio' => '',
                'location' => '',
                'website' => '',
            ]);

            // Set user meta if WordPress user exists
            if ($user->wp_user_id) {
                update_user_meta($user->wp_user_id, 'custom_user_id', $user->id);
            }
        });

        static::updated(function ($user) {
            // Clear caches
            wp_cache_delete("user_{$user->id}");
            if ($user->wp_user_id) {
                clean_user_cache($user->wp_user_id);
            }
        });

        static::deleting(function ($user) {
            // Delete related records
            $user->posts()->delete();

            // WordPress cleanup
            if ($user->wp_user_id) {
                delete_user_meta($user->wp_user_id, 'custom_user_id');
            }
        });
    }
}
```

This model demonstrates:
- Table configuration and mass assignment
- Timestamps and soft deletes  
- Accessors and mutators for data transformation
- Attribute casting including custom casts
- Relationships with other models
- WordPress integration (users, meta, capabilities)
- Model events for lifecycle hooks
- Serialization control

Models in AvelPress provide a powerful and elegant way to work with your database while maintaining full WordPress compatibility and following modern PHP practices.
