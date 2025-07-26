# Mass Assignment

Mass assignment allows you to create or update multiple attributes at once. AvelPress provides security controls to protect against unauthorized attribute modification.

## Fillable Attributes

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

## Guarded Attributes

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

## Creating Records with Mass Assignment

### Using create()

```php
$user = User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'status' => 'active'
]);
```

### Using firstOrCreate()

```php
$user = User::firstOrCreate(
    ['email' => 'john@example.com'], // Search criteria
    ['name' => 'John Doe', 'status' => 'active'] // Additional data if creating
);
```

### Using updateOrCreate()

```php
$user = User::updateOrCreate(
    ['email' => 'john@example.com'], // Search criteria  
    ['name' => 'John Smith', 'status' => 'active'] // Data to update/create
);
```

## Updating with Mass Assignment

```php
// Mass update single model
$user = User::find(1);
$user->update(['name' => 'Jane Doe', 'status' => 'inactive']);

// Update multiple models
User::where('status', 'pending')
    ->update(['status' => 'active']);
```

## Bulk Operations

```php
// Insert multiple records
User::createMany([
    ['name' => 'John', 'email' => 'john@example.com'],
    ['name' => 'Jane', 'email' => 'jane@example.com'],
    ['name' => 'Bob', 'email' => 'bob@example.com']
]);
```

## Security Considerations

Always use fillable or guarded attributes to prevent mass assignment vulnerabilities:

```php
class User extends Model
{
    // GOOD: Only allow safe attributes
    protected $fillable = ['name', 'email', 'bio'];
    
    // DANGEROUS: Never do this in production
    // protected $guarded = [];
}
```

## CLI Integration

When using the AvelPress CLI, you can specify fillable attributes:

```bash
# Generate model with fillable attributes
avel make:model Product --fillable=name,price,description,category_id
```

This will create:

```php
class Product extends Model {
    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'price', 
        'description',
        'category_id',
    ];
}
```
