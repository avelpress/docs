# Schema Builder

The AvelPress Schema Builder provides a database-agnostic way to create and modify database tables. It offers a fluent interface for defining table structures, making it easy to manage your database schema.

## Introduction

The Schema Builder works by defining blueprints for your tables. These blueprints contain column definitions, indexes, foreign keys, and other table constraints that will be executed against your database.

## Basic Usage

### Creating Tables

Use the `Schema::create()` method to create new tables:

```php
<?php

use AvelPress\Database\Schema\Schema;
use AvelPress\Database\Schema\Blueprint;

Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->timestamps();
});
```

### Modifying Tables

Use `Schema::table()` to modify existing tables:

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('phone')->nullable();
    $table->string('address')->nullable();
});
```

### Dropping Tables

Remove tables using `Schema::drop()`:

```php
// Drop table (will fail if table doesn't exist)
Schema::drop('posts');

// Drop table if it exists
Schema::dropIfExists('posts');
```

## Column Types

### Numeric Columns

```php
$table->id();                          // Auto-increment big integer primary key
$table->bigInteger('votes');           // BIGINT equivalent
$table->integer('votes');              // INTEGER equivalent
$table->mediumInteger('votes');        // MEDIUM INTEGER equivalent
$table->smallInteger('votes');         // SMALL INTEGER equivalent
$table->tinyInteger('votes');          // TINY INTEGER equivalent
$table->unsignedBigInteger('votes');   // Unsigned BIGINT equivalent
$table->unsignedInteger('votes');      // Unsigned INTEGER equivalent
$table->decimal('amount', 8, 2);       // DECIMAL equivalent with precision and scale
$table->float('amount', 8, 2);         // FLOAT equivalent with precision and scale
$table->double('amount', 8, 2);        // DOUBLE equivalent with precision and scale
```

### String Columns

```php
$table->string('name');                // VARCHAR equivalent with optional length
$table->string('name', 100);          // VARCHAR with specific length
$table->text('description');          // TEXT equivalent
$table->mediumText('description');    // MEDIUM TEXT equivalent
$table->longText('description');      // LONG TEXT equivalent
$table->char('code', 4);              // CHAR equivalent with length
$table->binary('data');               // BINARY equivalent
```

### Date and Time Columns

```php
$table->date('created_date');          // DATE equivalent
$table->dateTime('created_at');        // DATETIME equivalent
$table->dateTime('created_at', 3);     // DATETIME with precision
$table->time('sunrise');               // TIME equivalent
$table->timestamp('added_at');         // TIMESTAMP equivalent
$table->timestamps();                  // created_at and updated_at DATETIME columns
$table->year('birth_year');           // YEAR equivalent
```

### Boolean and Other Types

```php
$table->boolean('confirmed');          // BOOLEAN equivalent
$table->enum('level', ['easy', 'hard']); // ENUM equivalent
$table->json('options');               // JSON equivalent (MySQL 5.7+)
$table->uuid('identifier');           // UUID equivalent
```

## Column Modifiers

### Nullable and Default Values

```php
$table->string('name')->nullable();              // Allow NULL values
$table->string('status')->default('active');     // Set default value
$table->integer('votes')->default(0);            // Numeric default
$table->boolean('confirmed')->default(true);     // Boolean default
$table->timestamp('created_at')->useCurrent();   // Use CURRENT_TIMESTAMP
```

### Auto Increment

```php
$table->id();                                    // Auto-increment primary key
$table->bigInteger('id')->autoIncrement();       // Custom auto-increment
```

### Indexes

```php
$table->string('email')->unique();               // Unique constraint
$table->string('name')->index();                 // Regular index
$table->index(['column1', 'column2']);           // Composite index
$table->unique(['first_name', 'last_name']);     // Composite unique
$table->index('email', 'idx_user_email');        // Named index
```

### Comments

```php
$table->string('name')->comment('User full name');
$table->integer('views')->comment('Page view count');
```

### Column Positioning (MySQL)

```php
$table->string('name')->after('id');             // Add column after another
$table->string('name')->first();                 // Add column as first
```

## Primary Keys

### Default Primary Key

```php
$table->id(); // Creates auto-incrementing bigint primary key named 'id'
```

### Custom Primary Keys

```php
// Custom primary key name
$table->id('user_id');

// String primary key
$table->string('code', 10)->primary();

// Composite primary key
$table->primary(['user_id', 'post_id']);

// Non-incrementing primary key
$table->bigInteger('id')->primary();
```

## Foreign Keys

### Basic Foreign Keys

```php
// Simple foreign key (references id on users table)
$table->foreignId('user_id')->constrained();

// Custom table reference
$table->foreignId('category_id')->constrained('categories');

// Custom column reference
$table->foreignId('author_id')->constrained('users', 'id');

// Manual foreign key definition
$table->unsignedBigInteger('user_id');
$table->foreign('user_id')->references('id')->on('users');
```

### Foreign Key Actions

```php
$table->foreignId('user_id')
    ->constrained()
    ->onUpdate('cascade')
    ->onDelete('cascade');

$table->foreignId('category_id')
    ->constrained()
    ->onDelete('set null');

$table->foreignId('parent_id')
    ->constrained('categories')
    ->onDelete('restrict');
```

### Dropping Foreign Keys

```php
Schema::table('posts', function (Blueprint $table) {
    $table->dropForeign(['user_id']);              // Drop by column
    $table->dropForeign('posts_user_id_foreign');  // Drop by constraint name
});
```

## Indexes

### Creating Indexes

```php
Schema::table('users', function (Blueprint $table) {
    $table->index('email');                        // Single column index
    $table->index(['first_name', 'last_name']);    // Composite index
    $table->unique('username');                    // Unique index
    $table->index('created_at', 'idx_created');    // Named index
});
```

### Index Types

```php
$table->primary('id');                            // Primary key
$table->primary(['id', 'parent_id']);             // Composite primary
$table->unique('email');                          // Unique constraint
$table->index('name');                            // Regular index
$table->fullText('body');                         // Full-text index (MySQL)
```

### Dropping Indexes

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropPrimary(['id']);                  // Drop primary key
    $table->dropUnique(['email']);                // Drop unique constraint
    $table->dropIndex(['email']);                 // Drop regular index
    $table->dropIndex('users_email_index');       // Drop by index name
});
```

## Advanced Features

### Conditional Schema Changes

```php
// Check if table exists
if (Schema::hasTable('users')) {
    Schema::table('users', function (Blueprint $table) {
        // Modify existing table
    });
}

// Check if column exists
if (Schema::hasColumn('users', 'phone')) {
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn('phone');
    });
}
```

### Renaming

```php
// Rename table
Schema::rename('from', 'to');

// Rename column
Schema::table('users', function (Blueprint $table) {
    $table->renameColumn('from', 'to');
});
```

### Raw SQL in Schema

```php
Schema::table('users', function (Blueprint $table) {
    // Add custom SQL
    $table->addColumn('enum', 'status', [
        'values' => ['active', 'inactive', 'pending']
    ]);
});

// Execute raw SQL
DB::statement('ALTER TABLE users ADD FULLTEXT(first_name, last_name)');
```

## WordPress Integration

### Table Prefixes

AvelPress automatically handles WordPress table prefixes:

```php
// This creates {wp_prefix}my_custom_table
Schema::create('my_custom_table', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->timestamps();
});
```

### WordPress-Compatible Columns

```php
Schema::create('posts', function (Blueprint $table) {
    $table->id('ID');                              // WordPress-style ID
    $table->string('post_title');
    $table->longText('post_content');
    $table->longText('post_excerpt');
    $table->string('post_status', 20)->default('publish');
    $table->string('post_type', 20)->default('post');
    $table->string('post_name');                   // Slug
    $table->unsignedBigInteger('post_author');
    $table->dateTime('post_date');
    $table->dateTime('post_date_gmt');
    $table->dateTime('post_modified');
    $table->dateTime('post_modified_gmt');
    $table->string('post_password')->default('');
    $table->integer('menu_order')->default(0);
    $table->longText('post_content_filtered');

    // WordPress indexes
    $table->index('post_name');
    $table->index('post_type');
    $table->index('post_status');
    $table->index('post_date');
    $table->index('post_author');
});
```

### Foreign Keys to WordPress Tables

```php
Schema::create('user_profiles', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('user_id');
    $table->text('bio')->nullable();
    $table->string('website')->nullable();
    $table->timestamps();

    // Reference WordPress users table
    $table->foreign('user_id')->references('ID')->on('users')->onDelete('cascade');
    $table->unique('user_id');
});

Schema::create('post_meta_extended', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('post_id');
    $table->string('meta_key');
    $table->longText('meta_value')->nullable();

    // Reference WordPress posts table
    $table->foreign('post_id')->references('ID')->on('posts')->onDelete('cascade');
    $table->index(['post_id', 'meta_key']);
});
```

### Custom Post Type Tables

```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->text('description');
    $table->decimal('price', 10, 2);
    $table->string('sku')->unique();
    $table->integer('stock_quantity')->default(0);
    $table->boolean('manage_stock')->default(false);
    $table->string('status')->default('publish');
    
    // Link to WordPress post
    $table->unsignedBigInteger('post_id')->nullable();
    $table->foreign('post_id')->references('ID')->on('posts')->onDelete('set null');
    
    $table->timestamps();
    
    // Indexes for performance
    $table->index('sku');
    $table->index('status');
    $table->index('price');
});
```

## Migration Integration

### In Migration Files

```php
<?php

use AvelPress\Database\Migrations\Migration;
use AvelPress\Database\Schema\Blueprint;
use AvelPress\Database\Schema\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
```

### Complex Table Structures

```php
public function up(): void
{
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->string('order_number')->unique();
        $table->foreignId('customer_id')->constrained()->onDelete('cascade');
        $table->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
              ->default('pending');
        $table->decimal('subtotal', 10, 2);
        $table->decimal('tax_amount', 10, 2)->default(0);
        $table->decimal('shipping_cost', 10, 2)->default(0);
        $table->decimal('total_amount', 10, 2);
        $table->json('shipping_address');
        $table->json('billing_address');
        $table->timestamp('shipped_at')->nullable();
        $table->timestamp('delivered_at')->nullable();
        $table->timestamps();

        // Indexes for performance
        $table->index('order_number');
        $table->index('status');
        $table->index(['customer_id', 'status']);
        $table->index('created_at');
    });

    Schema::create('order_items', function (Blueprint $table) {
        $table->id();
        $table->foreignId('order_id')->constrained()->onDelete('cascade');
        $table->foreignId('product_id')->constrained()->onDelete('cascade');
        $table->string('product_name');  // Snapshot of product name
        $table->decimal('unit_price', 10, 2);
        $table->integer('quantity');
        $table->decimal('line_total', 10, 2);
        $table->timestamps();

        // Composite index for order items
        $table->index(['order_id', 'product_id']);
    });
}
```

## Best Practices

### 1. Use Appropriate Data Types

```php
// Good
$table->string('email', 100);          // Reasonable length for emails
$table->decimal('price', 10, 2);       // Precise decimal for money
$table->boolean('is_active');          // Clear boolean intent

// Avoid
$table->string('email');               // Unnecessarily long (255 chars)
$table->float('price');                // Imprecise for money
$table->tinyInteger('is_active');      // Unclear boolean intent
```

### 2. Add Appropriate Indexes

```php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('content');
    $table->string('slug')->unique();   // Unique index for slugs
    $table->string('status')->index();  // Index for frequent queries
    $table->foreignId('author_id')->constrained('users');
    $table->timestamps();

    // Composite indexes for common query patterns
    $table->index(['status', 'created_at']);
    $table->index(['author_id', 'status']);
});
```

### 3. Design for WordPress Compatibility

```php
Schema::create('plugin_settings', function (Blueprint $table) {
    $table->id();
    $table->string('option_name')->unique();
    $table->longText('option_value');
    $table->string('autoload', 20)->default('yes');
    $table->timestamps();

    // Similar structure to wp_options
    $table->index('option_name');
    $table->index('autoload');
});
```

### 4. Handle Character Sets

```php
// WordPress uses utf8mb4 by default
Schema::create('comments', function (Blueprint $table) {
    $table->id();
    $table->longText('content');  // Supports emojis and special characters
    $table->string('author_name');
    $table->string('author_email');
    $table->timestamps();
});
```

### 5. Foreign Key Considerations

```php
// Good: Handles cascading deletes properly
$table->foreignId('user_id')->constrained()->onDelete('cascade');
$table->foreignId('category_id')->constrained()->onDelete('set null');

// Be careful with WordPress core tables
$table->unsignedBigInteger('wp_user_id');
$table->foreign('wp_user_id')->references('ID')->on('users')->onDelete('cascade');
```

The Schema Builder provides a powerful and WordPress-compatible way to manage your database structure, ensuring your tables work seamlessly with both AvelPress and WordPress core functionality.
