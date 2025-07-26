# Querying Models

AvelPress models provide a fluent interface for querying your database. You can retrieve records using various methods and apply filters, ordering, and other constraints.

## Retrieving Records

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

## Query Conditions

### Basic Where Clauses

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
```

### Advanced Where Clauses

```php
// Where in
$users = User::whereIn('status', ['active', 'premium'])->get();

// Where not in
$users = User::whereNotIn('status', ['banned', 'suspended'])->get();

// Between
$users = User::whereBetween('age', [18, 65])->get();

// Like searches
$users = User::where('name', 'like', '%john%')->get();

// Null checks
$unverifiedUsers = User::whereNull('email_verified_at')->get();
$verifiedUsers = User::whereNotNull('email_verified_at')->get();

// Date queries
$recentUsers = User::where('created_at', '>', '2024-01-01')->get();
$todayUsers = User::whereDate('created_at', '2024-07-24')->get();
```

### Conditional Queries

```php
$query = User::query();

if ($request->has('status')) {
    $query->where('status', $request->get('status'));
}

if ($request->has('search')) {
    $query->where('name', 'like', '%' . $request->get('search') . '%');
}

$users = $query->get();
```

## Ordering and Limiting

### Ordering Results

```php
// Order by
$users = User::orderBy('created_at', 'desc')->get();

// Multiple ordering
$users = User::orderBy('status')
    ->orderBy('name', 'asc')
    ->get();

// Latest and oldest
$latestUsers = User::latest()->get(); // Orders by created_at desc
$oldestUsers = User::oldest()->get(); // Orders by created_at asc

// Random order
$randomUsers = User::inRandomOrder()->get();
```

### Limiting Results

```php
// Limit and offset
$users = User::limit(10)->offset(20)->get();

// Take (alias for limit)
$users = User::take(5)->get();

// Skip (alias for offset)
$users = User::skip(10)->take(5)->get();

// First N records
$firstTenUsers = User::limit(10)->get();
```

## Aggregates

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

## Grouping and Having

```php
// Group by
$usersByStatus = User::select('status', DB::raw('count(*) as total'))
    ->groupBy('status')
    ->get();

// Having
$popularTags = Tag::select('name', DB::raw('count(*) as post_count'))
    ->groupBy('name')
    ->having('post_count', '>', 5)
    ->get();
```

## Raw Queries

When you need more complex queries:

```php
use AvelPress\Facades\DB;

// Raw where clauses
$users = User::whereRaw('age > ? AND status = ?', [18, 'active'])->get();

// Raw selects
$stats = User::selectRaw('COUNT(*) as total, AVG(age) as avg_age')->first();

// Raw order by
$users = User::orderByRaw('FIELD(status, "premium", "active", "inactive")')->get();
```

## Pagination

```php
// Paginate results
$users = User::paginate(15); // 15 per page

// Custom pagination
$users = User::where('status', 'active')->paginate(10);

// Simple pagination (only next/previous)
$users = User::simplePaginate(15);

// Get pagination info
echo $users->currentPage();
echo $users->lastPage();
echo $users->total();
echo $users->count();
echo $users->perPage();

// Check if there are more pages
if ($users->hasPages()) {
    echo "Multiple pages available";
}

// Render pagination links (WordPress style)
echo $users->links();
```

## Collections

Models return Collection instances that provide additional methods:

```php
$users = User::where('status', 'active')->get();

// Collection methods
$names = $users->pluck('name');
$emails = $users->pluck('email', 'id'); // Key by ID

$grouped = $users->groupBy('status');
$filtered = $users->filter(function ($user) {
    return $user->age > 18;
});

// Transform
$userEmails = $users->map(function ($user) {
    return strtolower($user->email);
});

// Reduce
$totalAge = $users->reduce(function ($carry, $user) {
    return $carry + $user->age;
}, 0);

// Sorting collections
$sortedUsers = $users->sortBy('name');
$sortedDesc = $users->sortByDesc('created_at');

// Chunking for memory efficiency
User::chunk(1000, function ($users) {
    foreach ($users as $user) {
        // Process user
    }
});
```

## Lazy Collections

For memory-efficient processing of large datasets:

```php
// Process users one by one to save memory
User::lazy()->each(function ($user) {
    // Process user without loading all into memory
});

// Lazy with filtering
User::where('status', 'active')
    ->lazy()
    ->filter(function ($user) {
        return $user->age > 18;
    })
    ->each(function ($user) {
        // Process adult active users
    });
```

## Query Performance Tips

### Select Only Needed Columns

```php
// Instead of loading all columns
$users = User::all();

// Select only what you need
$users = User::select(['id', 'name', 'email'])->get();
```

### Use Indexes

```php
// Make sure your database has indexes on frequently queried columns
$users = User::where('email', 'john@example.com')->get(); // Index on email
$posts = Post::where('status', 'published')->get(); // Index on status
```

### Avoid N+1 Problems

```php
// BAD: N+1 problem
$users = User::all();
foreach ($users as $user) {
    echo $user->posts->count(); // Queries database for each user
}

// GOOD: Use aggregates
$users = User::withCount('posts')->get();
foreach ($users as $user) {
    echo $user->posts_count; // No additional queries
}
```

### Use Chunking for Large Datasets

```php
// Instead of loading 100,000 records at once
User::chunk(1000, function ($users) {
    foreach ($users as $user) {
        // Process in smaller batches
    }
});
```

## WordPress Integration

### Querying WordPress Users

```php
class User extends Model
{
    // Query users with WordPress capabilities
    public static function withCapability($capability)
    {
        return static::whereHas('wordpressUser', function ($query) use ($capability) {
            // Custom logic to check capabilities
        });
    }
    
    // Query by WordPress user meta
    public static function withMeta($key, $value)
    {
        return static::where('wp_user_id', function ($query) use ($key, $value) {
            $query->select('user_id')
                ->from('wp_usermeta')
                ->where('meta_key', $key)
                ->where('meta_value', $value);
        });
    }
}

// Usage
$admins = User::withCapability('manage_options')->get();
$subscribers = User::withMeta('wp_capabilities', 'subscriber')->get();
```
