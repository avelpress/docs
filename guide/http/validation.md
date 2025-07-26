# Validation

AvelPress provides a robust validation system that allows you to validate incoming request data before processing it in your controllers. The validation system supports nested data structures, custom rules, and WordPress-specific validations.

## Introduction

Validation in AvelPress helps ensure that the data your application receives is correct and secure. The validation system is inspired by Laravel's validator but optimized for WordPress environments and REST API endpoints.

## Basic Validation

### Using the Validator Class

The simplest way to validate data is using the `Validator` class directly:

```php
<?php

use AvelPress\Support\Validator;

class ProductController extends Controller
{
    public function store($request)
    {
        $validator = Validator::make($request->get_params(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|integer',
            'description' => 'nullable|string|max:1000',
            'tags' => 'array',
            'tags.*' => 'string|max:50',
        ]);

        $validator->validate();

        if ($validator->fails()) {
            return new WP_Error('validation_failed', 'Validation failed', [
                'status' => 422,
                'errors' => $validator->errors()
            ]);
        }

        $validatedData = $validator->validated();
        
        // Create product with validated data
        $product = Product::create($validatedData);

        return rest_ensure_response($product);
    }
}
```

### Basic Usage Pattern

```php
// Create validator instance
$validator = new Validator($data, $rules);

// Or use static factory method
$validator = Validator::make($data, $rules);

// Run validation
$validator->validate();

// Check for errors
if ($validator->fails()) {
    $errors = $validator->errors();
    // Handle validation errors
}

// Get validated data
$validatedData = $validator->validated();
```

## Form Request Classes

For more complex validation scenarios, use Form Request classes that extend the base validator:

```php
<?php

namespace App\Http\Requests;

use AvelPress\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|integer',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|in:draft,published,archived',
            'featured_image' => 'nullable|string',
            'gallery' => 'array',
            'gallery.*' => 'string',
            'meta' => 'array',
            'meta.seo_title' => 'nullable|string|max:60',
            'meta.seo_description' => 'nullable|string|max:160',
            'variations' => 'array',
            'variations.*.sku' => 'required|string',
            'variations.*.price' => 'required|numeric|min:0',
            'variations.*.stock' => 'integer|min:0',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    public function prepareForValidation()
    {
        $this->merge([
            'slug' => $this->get('slug') ?: sanitize_title($this->get('name')),
            'name' => sanitize_text_field($this->get('name')),
            'description' => wp_kses_post($this->get('description')),
            'price' => (float) $this->get('price'),
            'category_id' => (int) $this->get('category_id'),
        ]);
    }
}
```

### Using Form Requests in Controllers

```php
<?php

namespace App\Controllers;

use AvelPress\Routing\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;

class ProductController extends Controller
{
    public function store(StoreProductRequest $request)
    {
        // Validation happens automatically
        // If validation fails, error response is returned automatically

        $validatedData = $request->validated();
        
        $product = Product::create($validatedData);

        return rest_ensure_response($product);
    }

    public function update(UpdateProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        
        $validatedData = $request->validated();
        
        $product->update($validatedData);

        return rest_ensure_response($product);
    }
}
```

## Available Validation Rules

### Basic Rules

```php
[
    'field' => 'required',           // Field must be present and not empty
    'field' => 'nullable',           // Field can be null or empty
    'field' => 'string',             // Field must be a string
    'field' => 'integer',            // Field must be an integer
    'field' => 'numeric',            // Field must be numeric
    'field' => 'array',              // Field must be an array
    'field' => 'email',              // Field must be a valid email
    'field' => 'date',               // Field must be a valid date
]
```

### String Rules

```php
[
    'name' => 'string|min:3',        // String with minimum 3 characters
    'name' => 'string|max:255',      // String with maximum 255 characters
    'name' => 'string|size:10',      // String with exactly 10 characters
    'code' => 'string|min:3|max:10', // String between 3 and 10 characters
]
```

### Numeric Rules

```php
[
    'age' => 'integer|min:18',       // Integer with minimum value 18
    'price' => 'numeric|min:0',      // Numeric with minimum value 0
    'rating' => 'numeric|min:1|max:5', // Numeric between 1 and 5
]
```

### Choice Rules

```php
[
    'status' => 'in:active,inactive,pending',     // Must be one of specified values
    'type' => 'in:individual,company',            // Limited to specific options
    'priority' => 'in:low,medium,high,urgent',    // Enumerated values
]
```

### Array Rules

```php
[
    'tags' => 'array',               // Field must be an array
    'tags.*' => 'string|max:50',     // Each array item must be string max 50 chars
    'items' => 'required|array',     // Required array
    'items.*.name' => 'required|string',      // Each item must have name
    'items.*.quantity' => 'required|integer|min:1',  // Each item quantity rules
]
```

### Nested Object Rules

```php
[
    'user' => 'required|array',
    'user.name' => 'required|string|max:255',
    'user.email' => 'required|email',
    'user.address' => 'array',
    'user.address.street' => 'required|string',
    'user.address.city' => 'required|string',
    'user.address.postal_code' => 'required|string|size:8',
]
```

## WordPress-Specific Validation

### WordPress Data Sanitization

Use the `prepareForValidation()` method to sanitize data using WordPress functions:

```php
class PostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'required|in:draft,publish,private',
            'featured_image' => 'nullable|integer',
        ];
    }

    public function prepareForValidation()
    {
        $this->merge([
            'title' => sanitize_text_field($this->get('title')),
            'content' => wp_kses_post($this->get('content')),
            'excerpt' => wp_trim_excerpt($this->get('excerpt')),
            'slug' => sanitize_title($this->get('title')),
            'status' => sanitize_key($this->get('status')),
            'featured_image' => (int) $this->get('featured_image'),
        ]);
    }
}
```

### User Permission Validation

```php
class AdminUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'role' => 'required|in:administrator,editor,author',
        ];
    }

    public function prepareForValidation()
    {
        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_die('You do not have permission to perform this action.');
        }

        $this->merge([
            'email' => sanitize_email($this->get('email')),
            'name' => sanitize_text_field($this->get('name')),
            'role' => sanitize_key($this->get('role')),
        ]);
    }
}
```

### WordPress File Upload Validation

```php
class MediaUploadRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'file' => 'required',
            'title' => 'nullable|string|max:255',
            'alt_text' => 'nullable|string|max:255',
        ];
    }

    public function prepareForValidation()
    {
        // Validate file upload
        if (!function_exists('wp_handle_upload')) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
        }

        $uploadedFile = $_FILES['file'] ?? null;
        
        if ($uploadedFile && $uploadedFile['error'] === UPLOAD_ERR_OK) {
            // Verify file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($uploadedFile['type'], $allowedTypes)) {
                wp_die('Invalid file type. Only images are allowed.');
            }

            // Verify file size (5MB limit)
            if ($uploadedFile['size'] > 5 * 1024 * 1024) {
                wp_die('File too large. Maximum size is 5MB.');
            }
        }

        $this->merge([
            'title' => sanitize_text_field($this->get('title')),
            'alt_text' => sanitize_text_field($this->get('alt_text')),
        ]);
    }
}
```

## Custom Validation Rules

### Adding Custom Rules

You can extend the Validator class to add custom validation rules:

```php
<?php

namespace App\Support;

use AvelPress\Support\Validator as BaseValidator;

class CustomValidator extends BaseValidator
{
    /**
     * Validate that a field is a valid WordPress user ID
     */
    protected function wpUser($field)
    {
        $value = $this->get($field);
        if ($value !== null && !get_user_by('id', $value)) {
            $this->errors[$field] = "The field {$field} must be a valid user ID.";
        }
    }

    /**
     * Validate that a field is a valid WordPress post ID
     */
    protected function wpPost($field)
    {
        $value = $this->get($field);
        if ($value !== null && !get_post($value)) {
            $this->errors[$field] = "The field {$field} must be a valid post ID.";
        }
    }

    /**
     * Validate that a field is a valid WordPress term ID
     */
    protected function wpTerm($field, $taxonomy = '')
    {
        $value = $this->get($field);
        if ($value !== null && !term_exists($value, $taxonomy)) {
            $this->errors[$field] = "The field {$field} must be a valid {$taxonomy} term.";
        }
    }

    /**
     * Validate that a field is a valid slug (URL-friendly)
     */
    protected function slug($field)
    {
        $value = $this->get($field);
        if ($value !== null && $value !== sanitize_title($value)) {
            $this->errors[$field] = "The field {$field} must be a valid slug.";
        }
    }

    /**
     * Validate that a field is unique in the database
     */
    protected function unique($field, $table, $column = null)
    {
        global $wpdb;
        
        $column = $column ?: $field;
        $value = $this->get($field);
        
        if ($value !== null) {
            $tableName = $wpdb->prefix . $table;
            $count = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$tableName} WHERE {$column} = %s",
                $value
            ));
            
            if ($count > 0) {
                $this->errors[$field] = "The field {$field} must be unique.";
            }
        }
    }
}
```

### Using Custom Validators

```php
class ProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => 'required|slug|unique:products,slug',
            'category_id' => 'required|wpTerm:product_category',
            'author_id' => 'required|wpUser',
        ];
    }

    protected function getValidatorInstance()
    {
        return new CustomValidator($this->all(), $this->rules());
    }
}
```

## Error Handling

### Basic Error Handling

```php
$validator = Validator::make($data, $rules);
$validator->validate();

if ($validator->fails()) {
    return new WP_Error('validation_failed', 'Validation failed', [
        'status' => 422,
        'errors' => $validator->errors()
    ]);
}
```

### Custom Error Messages

```php
class ProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required.',
            'name.max' => 'Product name cannot exceed 255 characters.',
            'price.required' => 'Product price is required.',
            'price.numeric' => 'Product price must be a valid number.',
            'price.min' => 'Product price cannot be negative.',
        ];
    }
}
```

### WordPress REST API Error Responses

```php
class ApiController extends Controller
{
    public function store($request)
    {
        $validator = Validator::make($request->get_params(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $validator->validate();

        if ($validator->fails()) {
            return new WP_REST_Response([
                'code' => 'validation_failed',
                'message' => 'Validation failed',
                'data' => [
                    'status' => 422,
                    'errors' => $validator->errors(),
                    'error_count' => count($validator->errors())
                ]
            ], 422);
        }

        // Process valid data
        $validatedData = $validator->validated();
        // ... rest of the logic
    }
}
```

## Working with Validated Data

### Getting Validated Data

```php
$validator = Validator::make($data, $rules);
$validator->validate();

// Get all validated data
$allData = $validator->validated();

// Get specific field
$name = $validator->validated('name');

// Get nested field
$email = $validator->validated('user.email');

// Get with default value
$status = $validator->validated('status') ?? 'draft';
```

### Using Validated Data

```php
class ProductController extends Controller
{
    public function store(StoreProductRequest $request)
    {
        $validatedData = $request->validated();

        // WordPress integration
        $post_id = wp_insert_post([
            'post_title' => $validatedData['name'],
            'post_content' => $validatedData['description'],
            'post_status' => $validatedData['status'],
            'post_type' => 'product',
        ]);

        // Create model with validated data
        $product = Product::create(array_merge($validatedData, [
            'wp_post_id' => $post_id
        ]));

        // Set post meta
        if (isset($validatedData['meta'])) {
            foreach ($validatedData['meta'] as $key => $value) {
                update_post_meta($post_id, $key, $value);
            }
        }

        return rest_ensure_response($product);
    }
}
```

## Advanced Validation

### Conditional Validation

```php
class OrderRequest extends FormRequest
{
    public function rules(): array
    {
        $rules = [
            'customer_type' => 'required|in:individual,company',
            'email' => 'required|email',
        ];

        // Add company-specific rules
        if ($this->get('customer_type') === 'company') {
            $rules['company_name'] = 'required|string|max:255';
            $rules['tax_id'] = 'required|string|size:14';
        }

        // Add individual-specific rules
        if ($this->get('customer_type') === 'individual') {
            $rules['first_name'] = 'required|string|max:100';
            $rules['last_name'] = 'required|string|max:100';
            $rules['document'] = 'required|string|size:11';
        }

        return $rules;
    }
}
```

### Array Validation with Dynamic Rules

```php
class QuoteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'customer' => 'required|array',
            'customer.name' => 'required|string|max:255',
            'customer.email' => 'required|email',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0|max:100',
            'payment_methods' => 'required|array|min:1',
            'payment_methods.*.method_id' => 'required|integer',
            'payment_methods.*.discount' => 'nullable|numeric|min:0',
        ];
    }

    public function prepareForValidation()
    {
        $this->merge([
            'customer.email' => sanitize_email($this->get('customer.email')),
            'customer.name' => sanitize_text_field($this->get('customer.name')),
        ]);

        // Validate and sanitize array items
        $items = $this->get('items', []);
        $cleanItems = [];
        
        foreach ($items as $item) {
            $cleanItems[] = [
                'product_id' => (int) ($item['product_id'] ?? 0),
                'quantity' => (int) ($item['quantity'] ?? 1),
                'price' => (float) ($item['price'] ?? 0),
                'discount' => isset($item['discount']) ? (float) $item['discount'] : 0,
            ];
        }
        
        $this->set('items', $cleanItems);
    }
}
```

### WordPress Integration Validation

```php
class PostValidation extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|in:draft,publish,private,pending',
            'category_ids' => 'array',
            'category_ids.*' => 'integer',
            'tags' => 'array',
            'tags.*' => 'string|max:50',
            'featured_image' => 'nullable|integer',
            'custom_fields' => 'array',
        ];
    }

    public function prepareForValidation()
    {
        // Validate user permissions
        $status = $this->get('status');
        if ($status === 'publish' && !current_user_can('publish_posts')) {
            wp_die('You do not have permission to publish posts.');
        }

        // Validate categories exist
        $categoryIds = $this->get('category_ids', []);
        $validCategoryIds = [];
        foreach ($categoryIds as $categoryId) {
            if (term_exists($categoryId, 'category')) {
                $validCategoryIds[] = (int) $categoryId;
            }
        }

        // Validate featured image exists
        $featuredImage = $this->get('featured_image');
        if ($featuredImage && !wp_attachment_is_image($featuredImage)) {
            $featuredImage = null;
        }

        $this->merge([
            'title' => sanitize_text_field($this->get('title')),
            'content' => wp_kses_post($this->get('content')),
            'slug' => sanitize_title($this->get('title')),
            'status' => sanitize_key($status),
            'category_ids' => $validCategoryIds,
            'featured_image' => $featuredImage ? (int) $featuredImage : null,
        ]);
    }
}
```

The validation system in AvelPress provides a comprehensive way to ensure data integrity while seamlessly integrating with WordPress's security and data handling features. It supports complex nested data structures, custom rules, and provides clear error reporting for better user experience.
