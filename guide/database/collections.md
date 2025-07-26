# Collections

Collections provide a fluent, convenient wrapper for working with arrays of data. They are particularly useful when working with groups of models or processing data sets in your application.

## Introduction

The AvelPress Collection class is inspired by Laravel's Collection and provides dozens of methods for working with arrays in a more expressive and functional way. Collections are especially useful when working with Eloquent model results, but can be used with any array data.

## Creating Collections

### Manual Creation

```php
use AvelPress\Support\Collection;

// Create from array
$collection = new Collection([1, 2, 3, 4, 5]);

// Create from models
$users = User::all(); // Returns a Collection
$posts = Post::where('status', 'published')->get(); // Returns a Collection
```

### Collection Helper

```php
// Using the collect helper (if available)
$collection = collect([1, 2, 3, 4, 5]);
$collection = collect(['name' => 'John', 'age' => 30]);
```

## Basic Operations

### Accessing Items

```php
$collection = new Collection([1, 2, 3, 4, 5]);

// Get all items
$all = $collection->all(); // [1, 2, 3, 4, 5]

// Count items
$count = $collection->count(); // 5

// Check if empty
$isEmpty = $collection->isEmpty(); // false

// Get first item
$first = $collection->first(); // 1

// Convert to array
$array = $collection->toArray(); // [1, 2, 3, 4, 5]
```

### Adding Items

```php
$collection = new Collection([1, 2, 3]);

// Push single item
$collection->push(4); // [1, 2, 3, 4]

// Push multiple items
$collection->push([5, 6]); // [1, 2, 3, 4, 5, 6]
```

## Filtering and Searching

### Filter

Filter the collection by a given callback:

```php
$collection = new Collection([1, 2, 3, 4, 5, 6]);

// Filter even numbers
$evens = $collection->filter(function ($item) {
    return $item % 2 == 0;
}); // [2, 4, 6]

// Filter without callback (removes falsy values)
$collection = new Collection([1, null, 2, '', 3, false, 4]);
$filtered = $collection->filter(); // [1, 2, 3, 4]
```

### Where

Filter items by a specific key-value pair:

```php
$users = new Collection([
    (object) ['name' => 'John', 'age' => 25],
    (object) ['name' => 'Jane', 'age' => 30],
    (object) ['name' => 'Bob', 'age' => 25],
]);

// Get users aged 25
$youngUsers = $users->where('age', 25);
```

### First Where

Find the first item matching a condition:

```php
$users = new Collection([
    (object) ['name' => 'John', 'active' => true],
    (object) ['name' => 'Jane', 'active' => false],
    (object) ['name' => 'Bob', 'active' => true],
]);

$firstActive = $users->firstWhere('active', true); // John
```

## Transformation

### Map

Transform each item in the collection:

```php
$collection = new Collection([1, 2, 3, 4, 5]);

// Square each number
$squared = $collection->map(function ($item) {
    return $item * $item;
}); // [1, 4, 9, 16, 25]

// Transform user objects
$users = User::all();
$userNames = $users->map(function ($user) {
    return $user->name;
});
```

### Pluck

Extract a specific field from each item:

```php
$users = new Collection([
    ['name' => 'John', 'email' => 'john@example.com'],
    ['name' => 'Jane', 'email' => 'jane@example.com'],
    ['name' => 'Bob', 'email' => 'bob@example.com'],
]);

// Pluck names
$names = $users->pluck('name'); // ['John', 'Jane', 'Bob']

// Pluck with keys
$emailMap = $users->pluck('email', 'name');
// ['John' => 'john@example.com', 'Jane' => 'jane@example.com', ...]
```

## Aggregation

### Sum

Calculate the sum of numeric values:

```php
$collection = new Collection([1, 2, 3, 4, 5]);
$sum = $collection->sum(); // 15

// Sum by key
$orders = new Collection([
    ['amount' => 100],
    ['amount' => 250],
    ['amount' => 75],
]);
$total = $orders->sum('amount'); // 425

// Sum with callback
$products = Product::all();
$totalValue = $products->sum(function ($product) {
    return $product->price * $product->quantity;
});
```

## Slicing and Chunking

### Slice

Get a portion of the collection:

```php
$collection = new Collection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

// Get items from index 2, take 3 items
$slice = $collection->slice(2, 3); // [3, 4, 5]

// Get items from index 5 to end
$slice = $collection->slice(5); // [6, 7, 8, 9, 10]
```

## Working with Models

### Model Collections

When working with Eloquent models, collections provide additional functionality:

```php
$users = User::all(); // Returns Collection of User models

// Convert models to arrays
$userArrays = $users->toArray();

// Get specific field from all models
$userIds = $users->pluck('id');
$userNames = $users->pluck('name', 'id');

// Filter models
$activeUsers = $users->filter(function ($user) {
    return $user->status === 'active';
});

// Transform models
$userSummaries = $users->map(function ($user) {
    return [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'posts_count' => $user->posts()->count(),
    ];
});
```

### Relationship Collections

Collections work seamlessly with model relationships:

```php
$user = User::find(1);
$posts = $user->posts; // Collection of Post models

// Get published posts
$publishedPosts = $posts->filter(function ($post) {
    return $post->status === 'published';
});

// Get post titles
$titles = $posts->pluck('title');

// Sum comments count
$totalComments = $posts->sum('comments_count');
```

## Real-World Examples

### E-commerce Cart

```php
class ShoppingCart
{
    protected $items;

    public function __construct()
    {
        $this->items = new Collection();
    }

    public function addItem($product, $quantity = 1)
    {
        $existingItem = $this->items->firstWhere('product_id', $product->id);

        if ($existingItem) {
            $existingItem->quantity += $quantity;
        } else {
            $this->items->push((object) [
                'product_id' => $product->id,
                'product' => $product,
                'quantity' => $quantity,
                'price' => $product->price,
            ]);
        }
    }

    public function getTotal()
    {
        return $this->items->sum(function ($item) {
            return $item->quantity * $item->price;
        });
    }

    public function getItemCount()
    {
        return $this->items->sum('quantity');
    }

    public function getItemsByCategory($category)
    {
        return $this->items->filter(function ($item) use ($category) {
            return $item->product->category === $category;
        });
    }
}
```

### Report Generation

```php
class SalesReport
{
    public function generateDailySales($date)
    {
        $orders = Order::whereDate('created_at', $date)->get();

        return [
            'total_orders' => $orders->count(),
            'total_revenue' => $orders->sum('total'),
            'average_order' => $orders->count() > 0 ? $orders->sum('total') / $orders->count() : 0,
            'top_products' => $this->getTopProducts($orders),
            'sales_by_hour' => $this->getSalesByHour($orders),
        ];
    }

    private function getTopProducts($orders)
    {
        $items = new Collection();

        $orders->each(function ($order) use ($items) {
            $order->items->each(function ($item) use ($items) {
                $items->push($item);
            });
        });

        return $items->groupBy('product_id')
            ->map(function ($productItems) {
                return [
                    'product_name' => $productItems->first()->product_name,
                    'total_quantity' => $productItems->sum('quantity'),
                    'total_revenue' => $productItems->sum(function ($item) {
                        return $item->quantity * $item->price;
                    }),
                ];
            })
            ->sortByDesc('total_revenue')
            ->take(10);
    }

    private function getSalesByHour($orders)
    {
        return $orders->groupBy(function ($order) {
            return $order->created_at->format('H');
        })->map(function ($hourOrders) {
            return [
                'order_count' => $hourOrders->count(),
                'revenue' => $hourOrders->sum('total'),
            ];
        });
    }
}
```

### User Management

```php
class UserManager
{
    public function getUserStatistics()
    {
        $users = User::all();

        return [
            'total_users' => $users->count(),
            'active_users' => $users->where('status', 'active')->count(),
            'users_by_role' => $this->getUsersByRole($users),
            'recent_signups' => $this->getRecentSignups($users),
            'top_contributors' => $this->getTopContributors($users),
        ];
    }

    private function getUsersByRole($users)
    {
        return $users->groupBy('role')
            ->map(function ($roleUsers) {
                return $roleUsers->count();
            });
    }

    private function getRecentSignups($users)
    {
        return $users->filter(function ($user) {
            return $user->created_at->isAfter(now()->subDays(7));
        })->count();
    }

    private function getTopContributors($users)
    {
        return $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'posts_count' => $user->posts()->count(),
                'comments_count' => $user->comments()->count(),
                'total_contribution' => $user->posts()->count() + $user->comments()->count(),
            ];
        })->sortByDesc('total_contribution')->take(10);
    }
}
```

### WordPress Integration

```php
class PostManager
{
    public function getPostAnalytics()
    {
        $posts = Post::all();

        return [
            'total_posts' => $posts->count(),
            'published_posts' => $posts->where('status', 'published')->count(),
            'draft_posts' => $posts->where('status', 'draft')->count(),
            'posts_by_category' => $this->getPostsByCategory($posts),
            'most_commented' => $this->getMostCommentedPosts($posts),
            'recent_posts' => $this->getRecentPosts($posts),
        ];
    }

    private function getPostsByCategory($posts)
    {
        return $posts->groupBy('category_id')
            ->map(function ($categoryPosts) {
                $category = $categoryPosts->first()->category;
                return [
                    'category_name' => $category->name,
                    'post_count' => $categoryPosts->count(),
                ];
            });
    }

    private function getMostCommentedPosts($posts)
    {
        return $posts->sortByDesc('comments_count')
            ->take(5)
            ->map(function ($post) {
                return [
                    'title' => $post->title,
                    'comments_count' => $post->comments_count,
                    'permalink' => get_permalink($post->id),
                ];
            });
    }

    private function getRecentPosts($posts)
    {
        return $posts->filter(function ($post) {
            return $post->created_at->isAfter(now()->subDays(30));
        })->sortByDesc('created_at')->take(10);
    }
}
```

## Custom Collections

You can extend the Collection class to create domain-specific collections:

```php
class UserCollection extends Collection
{
    public function admins()
    {
        return $this->filter(function ($user) {
            return $user->role === 'admin';
        });
    }

    public function active()
    {
        return $this->filter(function ($user) {
            return $user->status === 'active';
        });
    }

    public function byRole($role)
    {
        return $this->filter(function ($user) use ($role) {
            return $user->role === $role;
        });
    }

    public function totalPosts()
    {
        return $this->sum('posts_count');
    }

    public function averageAge()
    {
        $totalAge = $this->sum('age');
        return $this->count() > 0 ? $totalAge / $this->count() : 0;
    }
}
```

Using custom collections:

```php
class User extends Model
{
    public function newCollection(array $models = [])
    {
        return new UserCollection($models);
    }
}

// Now User::all() returns UserCollection
$users = User::all();
$admins = $users->admins();
$activeUsers = $users->active();
$totalPosts = $users->totalPosts();
```

## Best Practices

### 1. Use Method Chaining

```php
// Good - readable and fluent
$result = $users
    ->filter(function ($user) { return $user->active; })
    ->map(function ($user) { return $user->name; })
    ->sort()
    ->take(10);

// Avoid - multiple assignments
$filtered = $users->filter(function ($user) { return $user->active; });
$mapped = $filtered->map(function ($user) { return $user->name; });
$sorted = $mapped->sort();
$result = $sorted->take(10);
```

### 2. Prefer Collections Over Arrays

```php
// Good - use collections for data manipulation
public function getActiveUserNames()
{
    return User::where('active', true)
        ->get()
        ->pluck('name');
}

// Avoid - manual array processing
public function getActiveUserNames()
{
    $users = User::where('active', true)->get();
    $names = [];
    foreach ($users as $user) {
        $names[] = $user->name;
    }
    return $names;
}
```

### 3. Use Lazy Loading with Collections

```php
// Eager load relationships before collection operations
$users = User::with('posts', 'comments')->get();

$userStats = $users->map(function ($user) {
    return [
        'name' => $user->name,
        'posts_count' => $user->posts->count(), // No N+1 query
        'comments_count' => $user->comments->count(), // No N+1 query
    ];
});
```

Collections in AvelPress provide a powerful and expressive way to work with data, making your code more readable and maintainable while providing performance benefits over traditional array manipulation.
