# Model Relationships

Relationships allow you to define connections between different models, making it easy to work with related data in your database.

## One to One

A one-to-one relationship links one record to exactly one other record.

### Defining the Relationship

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
```

### Custom Foreign Keys

```php
class User extends Model
{
    public function profile()
    {
        return $this->hasOne(Profile::class, 'user_id', 'id');
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

### Using the Relationship

```php
$user = User::find(1);
$profile = $user->profile; // Get the user's profile

$profile = Profile::find(1);
$user = $profile->user; // Get the profile's user

// Check if relationship exists
if ($user->profile) {
    echo $user->profile->bio;
}

// Create related model
$user = User::find(1);
$profile = $user->profile()->create([
    'bio' => 'Software developer',
    'location' => 'New York'
]);
```

## One to Many

A one-to-many relationship links one record to multiple other records.

### Defining the Relationship

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
    
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}

class Comment extends Model
{
    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
```

### Using the Relationship

```php
$user = User::find(1);
$posts = $user->posts; // Get all user's posts

foreach ($posts as $post) {
    echo $post->title;
}

// Get posts with additional constraints
$publishedPosts = $user->posts()->where('status', 'published')->get();

// Count related models
$postCount = $user->posts()->count();

// Create related model
$user = User::find(1);
$post = $user->posts()->create([
    'title' => 'New Post',
    'content' => 'Post content...',
    'status' => 'published'
]);

// Associate existing model
$post = Post::find(1);
$user = User::find(2);
$user->posts()->save($post);
```

## Many to Many

A many-to-many relationship allows multiple records to be related to multiple other records through a pivot table.

### Defining the Relationship

```php
class User extends Model
{
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }
}

class Role extends Model
{
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}

// With custom table and column names
class User extends Model
{
    public function roles()
    {
        return $this->belongsToMany(
            Role::class,
            'user_roles', // Pivot table name
            'user_id',    // Foreign key on pivot table for current model
            'role_id'     // Foreign key on pivot table for related model
        );
    }
}
```

### Using the Relationship

```php
$user = User::find(1);
$roles = $user->roles; // Get all user's roles

// Attach roles to user
$user->roles()->attach([1, 2, 3]);
$user->roles()->attach(1, ['expires_at' => '2024-12-31']); // With pivot data

// Detach roles
$user->roles()->detach([1, 2]);
$user->roles()->detach(); // Detach all

// Sync roles (attach new, detach removed)
$user->roles()->sync([1, 2, 3]);

// Toggle roles
$user->roles()->toggle([1, 2]);

// Check if user has role
if ($user->roles()->where('name', 'admin')->exists()) {
    echo 'User is admin';
}
```

### Pivot Table Data

```php
class User extends Model
{
    public function roles()
    {
        return $this->belongsToMany(Role::class)
            ->withPivot(['expires_at', 'granted_by'])
            ->withTimestamps();
    }
}

// Access pivot data
$user = User::find(1);
foreach ($user->roles as $role) {
    echo $role->name;
    echo $role->pivot->expires_at;
    echo $role->pivot->granted_by;
}

// Update pivot data
$user->roles()->updateExistingPivot(1, ['expires_at' => '2025-12-31']);
```

## Has Many Through

Access distant relationships through intermediate models.

```php
class Country extends Model
{
    public function users()
    {
        return $this->hasMany(User::class);
    }
    
    public function posts()
    {
        return $this->hasManyThrough(Post::class, User::class);
    }
}

class User extends Model
{
    public function country()
    {
        return $this->belongsTo(Country::class);
    }
    
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
$country = Country::find(1);
$posts = $country->posts; // All posts from users in this country
```

## Polymorphic Relationships

Allow a model to belong to more than one other model on a single association.

### One to Many Polymorphic

```php
class Comment extends Model
{
    public function commentable()
    {
        return $this->morphTo();
    }
}

class Post extends Model
{
    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

class Video extends Model
{
    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
```

### Using Polymorphic Relationships

```php
// Create comments for different models
$post = Post::find(1);
$post->comments()->create(['content' => 'Great post!']);

$video = Video::find(1);
$video->comments()->create(['content' => 'Nice video!']);

// Access the parent model
$comment = Comment::find(1);
$commentable = $comment->commentable; // Could be Post or Video

// Check the type
if ($comment->commentable_type === 'App\\Models\\Post') {
    // It's a post comment
}
```

### Many to Many Polymorphic

```php
class Tag extends Model
{
    public function posts()
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }
    
    public function videos()
    {
        return $this->morphedByMany(Video::class, 'taggable');
    }
}

class Post extends Model
{
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}

class Video extends Model
{
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
```

## Eager Loading

Prevent N+1 query problems by loading relationships efficiently.

### Basic Eager Loading

```php
// N+1 problem (bad)
$users = User::all();
foreach ($users as $user) {
    echo $user->profile->bio; // Executes a query for each user
}

// Eager loading (good)
$users = User::with('profile')->get();
foreach ($users as $user) {
    echo $user->profile->bio; // Profile already loaded
}
```

### Multiple Relationships

```php
// Load multiple relationships
$users = User::with(['posts', 'profile', 'roles'])->get();

// Nested relationships
$users = User::with('posts.comments')->get();

// Mixed relationships
$users = User::with(['posts.comments.author', 'profile'])->get();
```

### Conditional Eager Loading

```php
// Load posts with conditions
$users = User::with(['posts' => function ($query) {
    $query->where('status', 'published')
          ->orderBy('created_at', 'desc');
}])->get();

// Load multiple relationships with conditions
$users = User::with([
    'posts' => function ($query) {
        $query->where('status', 'published');
    },
    'comments' => function ($query) {
        $query->where('approved', true);
    }
])->get();
```

### Lazy Eager Loading

Load relationships after the model is retrieved:

```php
$users = User::all();

// Later, load relationships
$users->load('posts');
$users->load(['posts.comments', 'profile']);

// With conditions
$users->load(['posts' => function ($query) {
    $query->where('status', 'published');
}]);
```

## Counting Related Models

```php
// Count related models
$users = User::withCount('posts')->get();
foreach ($users as $user) {
    echo $user->posts_count;
}

// Multiple counts
$users = User::withCount(['posts', 'comments'])->get();

// Conditional counts
$users = User::withCount([
    'posts',
    'posts as published_posts_count' => function ($query) {
        $query->where('status', 'published');
    }
])->get();

// Average, sum, max, min
$users = User::withAvg('posts', 'views')->get();
$users = User::withSum('orders', 'amount')->get();
```

## Querying Relationships

### Has Queries

```php
// Users who have posts
$users = User::has('posts')->get();

// Users who have at least 3 posts
$users = User::has('posts', '>=', 3)->get();

// Users who have published posts
$users = User::whereHas('posts', function ($query) {
    $query->where('status', 'published');
})->get();

// Users who don't have posts
$users = User::doesntHave('posts')->get();

// Users who don't have published posts
$users = User::whereDoesntHave('posts', function ($query) {
    $query->where('status', 'published');
})->get();
```

### Relationship Queries

```php
// Query through relationships
$posts = Post::whereRelation('user', 'status', 'active')->get();

// Or using joins
$posts = Post::join('users', 'posts.user_id', '=', 'users.id')
    ->where('users.status', 'active')
    ->select('posts.*')
    ->get();
```

## WordPress Integration

### WordPress User Relationships

```php
class User extends Model
{
    public function wordpressUser()
    {
        return $this->hasOne(WP_User::class, 'ID', 'wp_user_id');
    }
    
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
    
    // Get WordPress posts
    public function wordpressPosts()
    {
        $wp_user = get_user_by('id', $this->wp_user_id);
        if ($wp_user) {
            return get_posts([
                'author' => $this->wp_user_id,
                'post_status' => 'any',
                'numberposts' => -1
            ]);
        }
        return [];
    }
}
```

### WordPress Post Relationships

```php
class Post extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    // Get WordPress post
    public function wordpressPost()
    {
        return get_post($this->wp_post_id);
    }
    
    // Get post meta
    public function getMeta($key, $single = true)
    {
        return get_post_meta($this->wp_post_id, $key, $single);
    }
    
    // WordPress categories (taxonomy)
    public function categories()
    {
        $wp_post = $this->wordpressPost();
        if ($wp_post) {
            return wp_get_post_categories($this->wp_post_id, ['fields' => 'all']);
        }
        return [];
    }
}
```

### Custom WordPress Relationships

```php
class Product extends Model
{
    // Related WordPress posts
    public function relatedPosts()
    {
        $related_ids = $this->getMeta('related_post_ids');
        if ($related_ids) {
            return get_posts([
                'include' => $related_ids,
                'post_type' => 'post',
                'post_status' => 'publish'
            ]);
        }
        return [];
    }
    
    // WooCommerce integration
    public function woocommerceProduct()
    {
        if ($this->wc_product_id) {
            return wc_get_product($this->wc_product_id);
        }
        return null;
    }
}
```

## Performance Tips

### Optimize Eager Loading

```php
// Load only needed columns
$users = User::with(['posts:id,user_id,title,status'])->get();

// Use select to limit columns on main model too
$users = User::select(['id', 'name', 'email'])
    ->with(['posts:id,user_id,title'])
    ->get();
```

### Use Constraints Wisely

```php
// Instead of loading all posts and filtering in PHP
$users = User::with('posts')->get();
$publishedPosts = $users->flatMap(function ($user) {
    return $user->posts->where('status', 'published');
});

// Load only published posts
$users = User::with(['posts' => function ($query) {
    $query->where('status', 'published');
}])->get();
```

### Consider Chunking

```php
// For large datasets, use chunking with relationships
User::with('posts')->chunk(100, function ($users) {
    foreach ($users as $user) {
        // Process user and their posts
    }
});
```
