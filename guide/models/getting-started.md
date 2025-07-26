# Getting Started with Models

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

## Basic Model Configuration

### Table Names

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

### Table Prefix

If your tables use a custom prefix, you can specify it:

```php
class User extends Model
{
    protected $prefix = 'custom_';
}
```

### Primary Keys

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

### Timestamps

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

## Next Steps

- [Mass Assignment](mass-assignment.md) - Learn about fillable and guarded attributes
- [Querying Models](querying.md) - Discover how to retrieve and filter data
- [Relationships](relationships.md) - Define connections between models
- [Accessors & Mutators](accessors-mutators.md) - Transform data when getting/setting
- [WordPress Integration](wordpress-integration.md) - Integrate with WordPress features
