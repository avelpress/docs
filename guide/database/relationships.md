# Database Relationships

AvelPress provides a powerful Eloquent ORM that supports various types of database relationships. These relationships allow you to easily work with related data across multiple database tables.

## Types of Relationships

### One-to-One

A one-to-one relationship is used when one record in a table relates to exactly one record in another table.

#### Defining One-to-One Relationships

```php
<?php

namespace App\Models;

use AvelPress\Database\Eloquent\Model;
use AvelPress\Database\Eloquent\Relations\HasOne;
use AvelPress\Database\Eloquent\Relations\BelongsTo;

class User extends Model
{
    protected $table = 'users';

    /**
     * Get the user's profile
     */
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }
}

class Profile extends Model
{
    protected $table = 'user_profiles';

    protected $fillable = [
        'user_id',
        'bio',
        'avatar',
        'website',
        'social_links'
    ];

    /**
     * Get the user that owns the profile
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

#### Using One-to-One Relationships

```php
// Get user with profile
$user = User::with('profile')->find(1);
echo $user->profile->bio;

// Create a profile for a user
$user = User::find(1);
$user->profile()->create([
    'bio' => 'Software developer passionate about WordPress',
    'website' => 'https://example.com',
    'social_links' => json_encode(['twitter' => '@username'])
]);

// Access user from profile
$profile = Profile::with('user')->find(1);
echo $profile->user->name;
```

### One-to-Many

A one-to-many relationship is used when one record can have multiple related records.

#### Defining One-to-Many Relationships

```php
<?php

namespace App\Models;

use AvelPress\Database\Eloquent\Model;
use AvelPress\Database\Eloquent\Relations\HasMany;
use AvelPress\Database\Eloquent\Relations\BelongsTo;

class Category extends Model
{
    protected $table = 'categories';

    protected $fillable = ['name', 'slug', 'description'];

    /**
     * Get all products in this category
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get active products in this category
     */
    public function activeProducts(): HasMany
    {
        return $this->hasMany(Product::class)->where('status', 'active');
    }
}

class Product extends Model
{
    protected $table = 'products';

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price',
        'status'
    ];

    /**
     * Get the category that owns the product
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
```

#### Using One-to-Many Relationships

```php
// Get category with all products
$category = Category::with('products')->find(1);
foreach ($category->products as $product) {
    echo $product->name . "\n";
}

// Get category with only active products
$category = Category::with('activeProducts')->find(1);

// Add a new product to a category
$category = Category::find(1);
$category->products()->create([
    'name' => 'New Product',
    'description' => 'A great new product',
    'price' => 99.99,
    'status' => 'active'
]);

// Get product with category
$product = Product::with('category')->find(1);
echo $product->category->name;

// Count products in category
$category = Category::find(1);
$productCount = $category->products()->count();
```

### Many-to-Many

A many-to-many relationship is used when multiple records in one table can relate to multiple records in another table.

#### Defining Many-to-Many Relationships

```php
<?php

namespace App\Models;

use AvelPress\Database\Eloquent\Model;
use AvelPress\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model
{
    protected $table = 'products';

    /**
     * The tags that belong to the product
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'product_tags');
    }

    /**
     * The tags with additional pivot data
     */
    public function tagsWithMetadata(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'product_tags')
                    ->withPivot(['priority', 'created_at'])
                    ->withTimestamps();
    }
}

class Tag extends Model
{
    protected $table = 'tags';

    protected $fillable = ['name', 'slug', 'color'];

    /**
     * The products that belong to the tag
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_tags');
    }
}
```

#### Migration for Many-to-Many

```php
<?php

use AvelPress\Database\Migrations\Migration;
use AvelPress\Database\Schema\Blueprint;
use AvelPress\Database\Schema\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('tag_id')->constrained('tags')->onDelete('cascade');
            $table->integer('priority')->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'tag_id']);
            $table->index(['product_id', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::drop('product_tags');
    }
};
```

#### Using Many-to-Many Relationships

```php
// Get product with tags
$product = Product::with('tags')->find(1);
foreach ($product->tags as $tag) {
    echo $tag->name . "\n";
}

// Attach tags to product
$product = Product::find(1);
$product->tags()->attach([1, 2, 3]);

// Attach with pivot data
$product->tags()->attach(1, ['priority' => 10]);

// Sync tags (removes old, adds new)
$product->tags()->sync([1, 2, 4]);

// Sync with pivot data
$product->tags()->sync([
    1 => ['priority' => 10],
    2 => ['priority' => 5],
    4 => ['priority' => 8]
]);

// Detach tags
$product->tags()->detach([1, 2]);
$product->tags()->detach(); // Detach all

// Access pivot data
$product = Product::with('tagsWithMetadata')->find(1);
foreach ($product->tagsWithMetadata as $tag) {
    echo $tag->name . ' (Priority: ' . $tag->pivot->priority . ')' . "\n";
}
```

### Has Many Through

This relationship provides a convenient way to access distant relations via an intermediate relation.

#### Defining Has Many Through

```php
<?php

namespace App\Models;

use AvelPress\Database\Eloquent\Model;
use AvelPress\Database\Eloquent\Relations\HasMany;
use AvelPress\Database\Eloquent\Relations\HasManyThrough;
use AvelPress\Database\Eloquent\Relations\BelongsTo;

class Country extends Model
{
    protected $table = 'countries';

    /**
     * Get all users in this country
     */
    public function users(): HasManyThrough
    {
        return $this->hasManyThrough(User::class, State::class);
    }

    /**
     * Get all states in this country
     */
    public function states(): HasMany
    {
        return $this->hasMany(State::class);
    }
}

class State extends Model
{
    protected $table = 'states';

    protected $fillable = ['country_id', 'name', 'code'];

    /**
     * Get the country that owns the state
     */
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    /**
     * Get all users in this state
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}

class User extends Model
{
    protected $table = 'users';

    protected $fillable = ['state_id', 'name', 'email'];

    /**
     * Get the state that owns the user
     */
    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }
}
```

#### Using Has Many Through

```php
// Get all users in a country
$country = Country::find(1);
$users = $country->users;

// Count users in a country
$userCount = $country->users()->count();

// Get users with additional constraints
$activeUsers = $country->users()->where('status', 'active')->get();
```

## WordPress Integration Examples

### Post and Meta Relationships

```php
<?php

namespace App\Models;

use AvelPress\Database\Eloquent\Model;
use AvelPress\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    protected $table = 'posts';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    /**
     * Get all meta for this post
     */
    public function meta(): HasMany
    {
        return $this->hasMany(PostMeta::class, 'post_id', 'ID');
    }

    /**
     * Get specific meta value
     */
    public function getMetaValue($key)
    {
        return $this->meta()->where('meta_key', $key)->value('meta_value');
    }

    /**
     * Set meta value
     */
    public function setMetaValue($key, $value)
    {
        return $this->meta()->updateOrCreate(
            ['meta_key' => $key],
            ['meta_value' => $value]
        );
    }
}

class PostMeta extends Model
{
    protected $table = 'postmeta';
    protected $primaryKey = 'meta_id';
    public $timestamps = false;

    protected $fillable = ['post_id', 'meta_key', 'meta_value'];

    /**
     * Get the post that owns this meta
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_id', 'ID');
    }
}
```

### User and Roles Relationships

```php
<?php

namespace App\Models;

use AvelPress\Database\Eloquent\Model;
use AvelPress\Database\Eloquent\Relations\BelongsToMany;

class User extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'ID';

    /**
     * Get user roles
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(
            Role::class,
            'user_roles',
            'user_id',
            'role_id',
            'ID',
            'id'
        );
    }

    /**
     * Check if user has role
     */
    public function hasRole($role): bool
    {
        if (is_string($role)) {
            return $this->roles()->where('name', $role)->exists();
        }

        return $this->roles()->where('id', $role)->exists();
    }

    /**
     * Assign role to user
     */
    public function assignRole($role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->first();
        }

        if ($role && !$this->hasRole($role->id)) {
            $this->roles()->attach($role->id);
        }
    }
}

class Role extends Model
{
    protected $table = 'roles';

    protected $fillable = ['name', 'display_name', 'capabilities'];

    /**
     * Get users with this role
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'user_roles',
            'role_id',
            'user_id',
            'id',
            'ID'
        );
    }
}
```

## Real-World Example: E-commerce Relationships

### Complete E-commerce Model Structure

```php
<?php

namespace App\Models;

use AvelPress\Database\Eloquent\Model;
use AvelPress\Database\Eloquent\Relations\HasMany;
use AvelPress\Database\Eloquent\Relations\BelongsTo;
use AvelPress\Database\Eloquent\Relations\BelongsToMany;

// Customer Model
class Customer extends Model
{
    protected $table = 'customers';

    protected $fillable = [
        'name', 'email', 'phone', 'type', 'status'
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function primaryAddress(): HasOne
    {
        return $this->hasOne(CustomerAddress::class)->where('is_primary', true);
    }
}

// Order Model
class Order extends Model
{
    protected $table = 'orders';

    protected $fillable = [
        'customer_id', 'status', 'total', 'tax', 'shipping',
        'payment_method', 'payment_status', 'notes'
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getTotalAttribute(): float
    {
        return $this->items->sum(function ($item) {
            return $item->quantity * $item->price;
        });
    }
}

// Order Item Model
class OrderItem extends Model
{
    protected $table = 'order_items';

    protected $fillable = [
        'order_id', 'product_id', 'quantity', 'price', 'discount'
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getLineTotalAttribute(): float
    {
        return ($this->quantity * $this->price) - $this->discount;
    }
}

// Product Model
class Product extends Model
{
    protected $table = 'products';

    protected $fillable = [
        'name', 'slug', 'description', 'price', 'stock', 'status'
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'product_categories');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function orders(): HasManyThrough
    {
        return $this->hasManyThrough(Order::class, OrderItem::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }
}

// Category Model
class Category extends Model
{
    protected $table = 'categories';

    protected $fillable = ['name', 'slug', 'description', 'parent_id'];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_categories');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }
}
```

### Using E-commerce Relationships

```php
// Get customer with recent orders and items
$customer = Customer::with(['orders.items.product'])->find(1);

foreach ($customer->orders as $order) {
    echo "Order #{$order->id} - Total: $" . number_format($order->total, 2) . "\n";
    
    foreach ($order->items as $item) {
        echo "  - {$item->product->name} x{$item->quantity} = $" . 
             number_format($item->line_total, 2) . "\n";
    }
}

// Get products with categories and recent orders
$products = Product::with(['categories', 'orders' => function ($query) {
    $query->where('created_at', '>=', now()->subDays(30));
}])->active()->inStock()->get();

// Get category with products and their order count
$category = Category::with(['products' => function ($query) {
    $query->withCount('orderItems');
}])->find(1);

// Create an order with items
$customer = Customer::find(1);
$order = $customer->orders()->create([
    'status' => 'pending',
    'payment_method' => 'credit_card',
    'payment_status' => 'pending',
    'notes' => 'Rush order'
]);

// Add items to order
$order->items()->create([
    'product_id' => 1,
    'quantity' => 2,
    'price' => 29.99,
    'discount' => 0
]);

$order->items()->create([
    'product_id' => 2,
    'quantity' => 1,
    'price' => 49.99,
    'discount' => 5.00
]);

// Calculate order total
$order->load('items');
$total = $order->total;
$order->update(['total' => $total]);
```

## Advanced Relationship Techniques

### Polymorphic Relationships

```php
<?php

namespace App\Models;

use AvelPress\Database\Eloquent\Model;
use AvelPress\Database\Eloquent\Relations\MorphTo;
use AvelPress\Database\Eloquent\Relations\MorphMany;

class Comment extends Model
{
    protected $fillable = ['content', 'user_id', 'commentable_id', 'commentable_type'];

    /**
     * Get the parent commentable model (post, product, etc.)
     */
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

class Post extends Model
{
    /**
     * Get all comments for the post
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

class Product extends Model
{
    /**
     * Get all comments for the product
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

// Usage
$post = Post::with('comments.user')->find(1);
$product = Product::with('comments.user')->find(1);

// Add comment to post
$post->comments()->create([
    'content' => 'Great post!',
    'user_id' => 1
]);

// Add comment to product
$product->comments()->create([
    'content' => 'Love this product!',
    'user_id' => 1
]);
```

### Conditional Relationships

```php
class User extends Model
{
    /**
     * Get published posts only
     */
    public function publishedPosts(): HasMany
    {
        return $this->hasMany(Post::class)->where('status', 'published');
    }

    /**
     * Get recent posts (last 30 days)
     */
    public function recentPosts(): HasMany
    {
        return $this->hasMany(Post::class)
                    ->where('created_at', '>=', now()->subDays(30))
                    ->orderBy('created_at', 'desc');
    }

    /**
     * Get posts with high engagement
     */
    public function popularPosts(): HasMany
    {
        return $this->hasMany(Post::class)
                    ->withCount(['comments', 'likes'])
                    ->having('comments_count', '>', 10)
                    ->orHaving('likes_count', '>', 50);
    }
}
```

Database relationships in AvelPress provide a powerful way to model and work with related data. By properly defining relationships, you can write more expressive and maintainable code while taking advantage of eager loading to optimize performance.

The key to successful relationship modeling is understanding your data structure and choosing the appropriate relationship types. Always consider performance implications and use eager loading when you know you'll need related data.
