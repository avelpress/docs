# Creating and Updating Models

This guide covers various ways to create and update model records in AvelPress.

## Creating Records

### Method 1: New Instance

```php
$user = new User;
$user->name = 'John Doe';
$user->email = 'john@example.com';
$user->status = 'active';
$user->save();
```

### Method 2: Mass Assignment

```php
$user = User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'status' => 'active'
]);
```

### Method 3: First or Create

Creates a record only if one doesn't already exist:

```php
$user = User::firstOrCreate(
    ['email' => 'john@example.com'], // Search criteria
    ['name' => 'John Doe', 'status' => 'active'] // Additional data if creating
);
```

### Method 4: Update or Create

Updates existing record or creates new one:

```php
$user = User::updateOrCreate(
    ['email' => 'john@example.com'], // Search criteria  
    ['name' => 'John Smith', 'status' => 'active'] // Data to update/create
);
```

### Bulk Creation

```php
// Insert multiple records efficiently
User::insert([
    ['name' => 'John', 'email' => 'john@example.com', 'created_at' => now()],
    ['name' => 'Jane', 'email' => 'jane@example.com', 'created_at' => now()],
    ['name' => 'Bob', 'email' => 'bob@example.com', 'created_at' => now()]
]);

// Create multiple with model events and mass assignment
User::createMany([
    ['name' => 'John', 'email' => 'john@example.com'],
    ['name' => 'Jane', 'email' => 'jane@example.com'],
    ['name' => 'Bob', 'email' => 'bob@example.com']
]);
```

## Updating Records

### Update Single Model

```php
// Method 1: Find and update attributes
$user = User::find(1);
$user->name = 'Jane Doe';
$user->email = 'jane@example.com';
$user->save();

// Method 2: Mass update single model
$user = User::find(1);
$user->update(['name' => 'Jane Doe', 'status' => 'inactive']);

// Method 3: Update without retrieving
User::where('id', 1)->update(['name' => 'Jane Doe']);
```

### Update Multiple Records

```php
// Update all records matching criteria
User::where('status', 'pending')
    ->update(['status' => 'active']);

// Update with additional conditions
User::where('created_at', '<', '2024-01-01')
    ->where('status', 'inactive')
    ->update(['status' => 'archived']);
```

### Increment and Decrement

```php
$user = User::find(1);

// Increment by 1
$user->increment('points');
$user->increment('login_count');

// Increment by specific amount
$user->increment('points', 10);
$user->increment('balance', 50.00);

// Decrement
$user->decrement('points', 5);

// Increment/decrement multiple columns
$user->increment('points', 1, ['last_activity' => now()]);

// Without retrieving the model
User::where('id', 1)->increment('view_count');
```

### Touch Timestamps

Update only the `updated_at` timestamp:

```php
$user = User::find(1);
$user->touch(); // Updates updated_at to current time

// Touch multiple models
User::whereIn('id', [1, 2, 3])->touch();
```

## Conditional Updates

### Only Update If Changed

```php
$user = User::find(1);

// Check if attribute has changed
if ($user->isDirty('email')) {
    // Email was changed
    $user->save();
}

// Get original values
$original = $user->getOriginal();
$originalEmail = $user->getOriginal('email');

// Check what changed
$changed = $user->getChanges();
```

### Update with Conditions

```php
// Only update if current status is 'pending'
$updated = User::where('id', 1)
    ->where('status', 'pending')
    ->update(['status' => 'approved']);

if ($updated) {
    echo "User was updated";
} else {
    echo "User was not updated (may not exist or not pending)";
}
```

## Upserting (Insert or Update)

```php
// Upsert single record
User::upsert([
    ['email' => 'john@example.com', 'name' => 'John Doe', 'points' => 100]
], ['email'], ['name', 'points']);

// Upsert multiple records
User::upsert([
    ['email' => 'john@example.com', 'name' => 'John Doe', 'points' => 100],
    ['email' => 'jane@example.com', 'name' => 'Jane Smith', 'points' => 150],
], ['email'], ['name', 'points']);
```

## Model Events During Creation/Updates

Models fire events during creation and updates:

```php
class User extends Model
{
    protected static function boot()
    {
        parent::boot();

        // Before creating
        static::creating(function ($user) {
            $user->uuid = wp_generate_uuid4();
            $user->slug = sanitize_title($user->name);
        });

        // After creating
        static::created(function ($user) {
            // Send welcome email
            wp_mail($user->email, 'Welcome!', 'Welcome to our site!');
        });

        // Before updating
        static::updating(function ($user) {
            // Log the change
            error_log("User {$user->id} is being updated");
        });

        // After updating
        static::updated(function ($user) {
            // Clear cache
            wp_cache_delete("user_{$user->id}");
        });

        // Before saving (creating or updating)
        static::saving(function ($user) {
            // Normalize email
            $user->email = strtolower($user->email);
        });

        // After saving (creating or updating)
        static::saved(function ($user) {
            // Update search index
            // UpdateSearchIndex::dispatch($user);
        });
    }
}
```

## WordPress Integration

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
                $user->email,
                wp_generate_password(),
                $user->email
            );

            if (!is_wp_error($wp_user_id)) {
                $user->update(['wp_user_id' => $wp_user_id]);
                
                // Set additional user meta
                update_user_meta($wp_user_id, 'first_name', $user->name);
                update_user_meta($wp_user_id, 'display_name', $user->name);
            }
        });
    }
}
```

### Sync with WordPress Data

```php
class Post extends Model
{
    public function syncWithWordPress()
    {
        if ($this->wp_post_id) {
            $wp_post = get_post($this->wp_post_id);
            
            if ($wp_post) {
                $this->update([
                    'title' => $wp_post->post_title,
                    'content' => $wp_post->post_content,
                    'status' => $wp_post->post_status,
                    'published_at' => $wp_post->post_date,
                ]);
            }
        }
    }

    // Automatically sync when updating
    protected static function boot()
    {
        parent::boot();

        static::updated(function ($post) {
            if ($post->wp_post_id && $post->isDirty(['title', 'content', 'status'])) {
                // Update WordPress post
                wp_update_post([
                    'ID' => $post->wp_post_id,
                    'post_title' => $post->title,
                    'post_content' => $post->content,
                    'post_status' => $post->status,
                ]);
            }
        });
    }
}
```

## Validation Before Save

```php
class User extends Model
{
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($user) {
            // Validate email
            if (!is_email($user->email)) {
                throw new \InvalidArgumentException('Invalid email format');
            }

            // Ensure unique email
            $exists = static::where('email', $user->email)
                ->where('id', '!=', $user->id)
                ->exists();
                
            if ($exists) {
                throw new \InvalidArgumentException('Email already exists');
            }

            // WordPress integration - check if email exists in WP users
            if (email_exists($user->email)) {
                throw new \InvalidArgumentException('Email already exists in WordPress');
            }
        });
    }
}
```

## Error Handling

```php
try {
    $user = User::create([
        'name' => 'John Doe',
        'email' => 'invalid-email', // This will trigger validation
    ]);
} catch (\InvalidArgumentException $e) {
    // Handle validation error
    wp_die('Validation error: ' . $e->getMessage());
} catch (\Exception $e) {
    // Handle other errors
    error_log('User creation failed: ' . $e->getMessage());
    wp_die('An error occurred while creating the user.');
}
```

## Performance Considerations

### Batch Operations

```php
// Instead of multiple individual creates
foreach ($users as $userData) {
    User::create($userData); // Multiple database calls
}

// Use batch insert for better performance
User::insert($users); // Single database call

// Or if you need model events
User::createMany($users); // Optimized batch creation with events
```

### Update Only Changed Attributes

```php
$user = User::find(1);
$user->name = 'New Name';

// Only saves if attributes actually changed
if ($user->isDirty()) {
    $user->save();
}

// Check specific attributes
if ($user->isDirty('email')) {
    // Email was changed
}
```

### Use Timestamps Wisely

```php
// Disable timestamps for bulk operations
User::withoutTimestamps(function () {
    User::insert($bulkData);
});

// Or disable for specific model
class LogEntry extends Model
{
    public $timestamps = false; // No created_at/updated_at overhead
}
```
