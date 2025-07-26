# Accessors and Mutators

Accessors and mutators allow you to transform data when retrieving from or storing to the database. They provide a clean way to format data consistently across your application.

## Accessors

Accessors transform data when retrieving from the database. They are called automatically when you access a model attribute.

### Basic Accessors

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

### Using Accessors

```php
$user = User::find(1);

echo $user->first_name; // Calls getFirstNameAttribute()
echo $user->avatar_url; // Calls getAvatarUrlAttribute()
echo $user->gravatar; // WordPress gravatar URL

// Original database value
echo $user->getRawOriginal('name'); // Original name without transformation
```

### Modern Accessor Syntax

Using the `Attribute` class for more complex transformations:

```php
use AvelPress\Database\Eloquent\Casts\Attribute;

class User extends Model
{
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn ($value, $attributes) => explode(' ', $attributes['name'])[0],
        );
    }

    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn ($value, $attributes) => $attributes['first_name'] . ' ' . $attributes['last_name'],
        );
    }

    protected function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                if ($attributes['avatar']) {
                    return wp_upload_dir()['baseurl'] . '/avatars/' . $attributes['avatar'];
                }
                return get_avatar_url($attributes['email']);
            }
        );
    }
}
```

## Mutators

Mutators transform data when saving to the database. They are called automatically when you set a model attribute.

### Basic Mutators

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

### Using Mutators

```php
$user = new User;
$user->password = 'plaintext'; // Automatically hashed
$user->email = 'JOHN@EXAMPLE.COM'; // Stored as lowercase
$user->title = 'My Blog Post'; // Generates slug automatically
$user->save();
```

### Modern Mutator Syntax

```php
use AvelPress\Database\Eloquent\Casts\Attribute;

class User extends Model
{
    protected function password(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => wp_hash_password($value),
        );
    }

    protected function email(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => strtolower($value),
            set: fn ($value) => strtolower(trim($value)),
        );
    }

    protected function slug(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => sanitize_title($value),
        );
    }
}
```

## Combined Accessors and Mutators

Handle both getting and setting in a single method:

```php
class Product extends Model
{
    protected function price(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value / 100, // Store in cents, return in dollars
            set: fn ($value) => $value * 100, // Convert dollars to cents for storage
        );
    }

    protected function description(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ucfirst($value),
            set: fn ($value) => strtolower(trim($value)),
        );
    }
}
```

## Appending Accessors to JSON

Make accessors available when converting models to arrays or JSON:

```php
class User extends Model
{
    // Append these accessors to array/JSON output
    protected $appends = ['first_name', 'avatar_url', 'gravatar'];

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

    public function getGravatarAttribute()
    {
        return get_avatar_url($this->email, 80);
    }
}
```

```php
$user = User::find(1);
$array = $user->toArray();
// Will include 'first_name', 'avatar_url', and 'gravatar'

$json = $user->toJson();
// JSON will include the appended attributes
```

## WordPress-Specific Examples

### User Meta Integration

```php
class User extends Model
{
    // WordPress user meta accessor
    public function getWpMetaAttribute()
    {
        if ($this->wp_user_id) {
            return get_user_meta($this->wp_user_id);
        }
        return [];
    }

    // Specific meta fields
    public function getDisplayNameAttribute()
    {
        if ($this->wp_user_id) {
            return get_user_meta($this->wp_user_id, 'display_name', true) ?: $this->name;
        }
        return $this->name;
    }

    // WordPress capabilities
    public function getCapabilitiesAttribute()
    {
        if ($this->wp_user_id) {
            $wp_user = get_user_by('id', $this->wp_user_id);
            return $wp_user ? $wp_user->allcaps : [];
        }
        return [];
    }

    // Set WordPress meta when updating
    public function setDisplayNameAttribute($value)
    {
        $this->attributes['display_name'] = $value;
        
        if ($this->wp_user_id) {
            update_user_meta($this->wp_user_id, 'display_name', $value);
        }
    }
}
```

### Post Meta Integration

```php
class Post extends Model
{
    // WordPress post meta
    public function getMetaAttribute()
    {
        if ($this->wp_post_id) {
            return get_post_meta($this->wp_post_id);
        }
        return [];
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
        if ($this->wp_post_id) {
            $wp_post = get_post($this->wp_post_id);
            return $wp_post ? wp_trim_excerpt('', $wp_post) : null;
        }
        return null;
    }

    // Set featured image
    public function setFeaturedImageAttribute($attachment_id)
    {
        if ($this->wp_post_id && $attachment_id) {
            set_post_thumbnail($this->wp_post_id, $attachment_id);
        }
    }
}
```

### Content Sanitization

```php
class Post extends Model
{
    // Sanitize content for WordPress
    public function setContentAttribute($value)
    {
        $this->attributes['content'] = wp_kses_post($value);
    }

    // Auto-generate excerpt
    public function setContentAttribute($value)
    {
        $this->attributes['content'] = wp_kses_post($value);
        
        // Generate excerpt if not provided
        if (!$this->excerpt) {
            $this->attributes['excerpt'] = wp_trim_excerpt($value);
        }
    }

    // Format title
    public function setTitleAttribute($value)
    {
        $this->attributes['title'] = sanitize_text_field($value);
        
        // Auto-generate slug
        if (!$this->slug) {
            $this->attributes['slug'] = sanitize_title($value);
        }
    }
}
```

## Date and Time Formatting

```php
class Post extends Model
{
    // Format published date
    public function getPublishedDateAttribute()
    {
        return $this->published_at ? $this->published_at->format('F j, Y') : null;
    }

    // Time ago format
    public function getTimeAgoAttribute()
    {
        if ($this->created_at) {
            return human_time_diff($this->created_at->timestamp, current_time('timestamp'));
        }
        return null;
    }

    // WordPress date format
    public function getWpDateAttribute()
    {
        if ($this->created_at) {
            return date_i18n(get_option('date_format'), $this->created_at->timestamp);
        }
        return null;
    }

    // WordPress time format
    public function getWpTimeAttribute()
    {
        if ($this->created_at) {
            return date_i18n(get_option('time_format'), $this->created_at->timestamp);
        }
        return null;
    }
}
```

## URL and Path Handling

```php
class Media extends Model
{
    // Get full URL
    public function getUrlAttribute()
    {
        if ($this->filename) {
            $upload_dir = wp_upload_dir();
            return $upload_dir['baseurl'] . '/' . $this->filename;
        }
        return null;
    }

    // Get file path
    public function getPathAttribute()
    {
        if ($this->filename) {
            $upload_dir = wp_upload_dir();
            return $upload_dir['basedir'] . '/' . $this->filename;
        }
        return null;
    }

    // File size in human readable format
    public function getFileSizeFormattedAttribute()
    {
        if ($this->file_size) {
            return size_format($this->file_size);
        }
        return null;
    }

    // Set filename with sanitization
    public function setFilenameAttribute($value)
    {
        $this->attributes['filename'] = sanitize_file_name($value);
    }
}
```

## Data Validation and Transformation

```php
class Product extends Model
{
    // Validate and format price
    public function setPriceAttribute($value)
    {
        // Convert to float and ensure positive
        $price = max(0, floatval($value));
        $this->attributes['price'] = $price;
    }

    // Format price for display
    public function getFormattedPriceAttribute()
    {
        return '$' . number_format($this->price, 2);
    }

    // Validate and set SKU
    public function setSkuAttribute($value)
    {
        $sku = strtoupper(trim($value));
        
        // Validate SKU format
        if (!preg_match('/^[A-Z0-9-]+$/', $sku)) {
            throw new \InvalidArgumentException('Invalid SKU format');
        }
        
        $this->attributes['sku'] = $sku;
    }

    // Format weight
    public function getWeightFormattedAttribute()
    {
        if ($this->weight) {
            return $this->weight . ' kg';
        }
        return null;
    }
}
```

## Performance Considerations

### Caching Expensive Accessors

```php
class User extends Model
{
    protected $accessorCache = [];

    public function getExpensiveDataAttribute()
    {
        if (!isset($this->accessorCache['expensive_data'])) {
            // Expensive computation or API call
            $this->accessorCache['expensive_data'] = $this->computeExpensiveData();
        }
        
        return $this->accessorCache['expensive_data'];
    }

    private function computeExpensiveData()
    {
        // Expensive operation
        return wp_remote_get('https://api.example.com/data/' . $this->id);
    }
}
```

### Conditional Accessors

```php
class Post extends Model
{
    public function getFeaturedImageAttribute()
    {
        // Only fetch if we actually have a WordPress post ID
        if (!$this->wp_post_id) {
            return null;
        }

        // Cache the result to avoid multiple calls
        if (!isset($this->accessorCache['featured_image'])) {
            $attachment_id = get_post_thumbnail_id($this->wp_post_id);
            $this->accessorCache['featured_image'] = $attachment_id 
                ? wp_get_attachment_image_url($attachment_id, 'full') 
                : null;
        }

        return $this->accessorCache['featured_image'];
    }
}
```

## Testing Accessors and Mutators

```php
// In your tests
public function test_email_mutator_converts_to_lowercase()
{
    $user = new User();
    $user->email = 'JOHN@EXAMPLE.COM';
    
    $this->assertEquals('john@example.com', $user->email);
}

public function test_first_name_accessor_returns_first_part()
{
    $user = new User(['name' => 'John Doe Smith']);
    
    $this->assertEquals('John', $user->first_name);
}

public function test_password_mutator_hashes_password()
{
    $user = new User();
    $user->password = 'plaintext';
    
    $this->assertTrue(wp_check_password('plaintext', $user->getAttributes()['password']));
}
```
