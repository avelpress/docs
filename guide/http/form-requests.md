# Form Requests

Form Requests are a powerful way to handle request validation in AvelPress. They provide a clean, organized approach to validating incoming HTTP requests before they reach your controllers.

## Introduction

Form Requests extend the base `AvelPress\Http\FormRequest` class and encapsulate validation logic for specific requests. This keeps your controllers clean and makes validation rules reusable.

## Creating Form Requests

### Manual Creation

Create form request classes in your `app/Http/Requests` directory:

```php
<?php

namespace App\Http\Requests;

use AvelPress\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'age' => 'integer|min:18',
        ];
    }
}
```

### Using CLI (if available)

```bash
# Generate a form request
avel make:request StoreUserRequest
```

## Basic Usage

### Defining Validation Rules

The `rules()` method should return an array of validation rules:

```php
public function rules(): array
{
    return [
        'title' => 'required|string|max:255',
        'content' => 'required|string',
        'status' => 'in:draft,published,archived',
        'category_id' => 'required|integer|exists:categories,id',
        'tags' => 'array',
        'tags.*' => 'string|max:50',
        'publish_date' => 'date|after:today',
    ];
}
```

### Available Validation Rules

AvelPress supports various validation rules:

| Rule | Description | Example |
|------|-------------|---------|
| `required` | Field must be present and not empty | `'name' => 'required'` |
| `string` | Field must be a string | `'title' => 'string'` |
| `integer` | Field must be an integer | `'age' => 'integer'` |
| `numeric` | Field must be numeric | `'price' => 'numeric'` |
| `email` | Field must be a valid email | `'email' => 'email'` |
| `min:value` | Field must be at least value | `'password' => 'min:8'` |
| `max:value` | Field must not exceed value | `'name' => 'max:255'` |
| `in:values` | Field must be one of values | `'status' => 'in:active,inactive'` |
| `array` | Field must be an array | `'tags' => 'array'` |
| `date` | Field must be a valid date | `'birth_date' => 'date'` |
| `unique:table,column` | Field must be unique in table | `'email' => 'unique:users,email'` |
| `exists:table,column` | Field must exist in table | `'user_id' => 'exists:users,id'` |

### Using in Controllers

Inject form requests into your controller methods:

```php
<?php

namespace App\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use AvelPress\Routing\Controller;

class UserController extends Controller
{
    public function store(StoreUserRequest $request)
    {
        // Request is automatically validated
        // If validation fails, error response is returned automatically
        
        $user = User::create($request->validated());
        return new JsonResource($user);
    }

    public function update(UpdateUserRequest $request)
    {
        $user = User::findOrFail($request->get_param('id'));
        $user->update($request->validated());
        
        return new JsonResource($user);
    }
}
```

## Advanced Features

### Data Preparation

Use `prepareForValidation()` to modify data before validation:

```php
public function prepareForValidation()
{
    $this->merge([
        'email' => strtolower(trim($this->get('email'))),
        'name' => ucwords(trim($this->get('name'))),
        'slug' => sanitize_title($this->get('title')),
    ]);
}
```

### Conditional Validation

Apply different rules based on request data:

```php
public function rules(): array
{
    $rules = [
        'name' => 'required|string|max:255',
        'email' => 'required|email',
    ];

    // Add password validation only for new users
    if (!$this->get('id')) {
        $rules['password'] = 'required|string|min:8';
    }

    // Different validation for user types
    if ($this->get('user_type') === 'admin') {
        $rules['admin_code'] = 'required|string';
    }

    return $rules;
}
```

### Custom Validation Messages

Override default validation messages:

```php
public function messages(): array
{
    return [
        'email.required' => 'The email address is required.',
        'email.email' => 'Please provide a valid email address.',
        'password.min' => 'The password must be at least :min characters.',
        'name.max' => 'The name may not be greater than :max characters.',
    ];
}
```

### Custom Attribute Names

Customize attribute names in error messages:

```php
public function attributes(): array
{
    return [
        'user_email' => 'email address',
        'user_name' => 'full name',
        'pwd' => 'password',
    ];
}
```

## WordPress Integration

### WordPress-Specific Validation

```php
public function rules(): array
{
    return [
        'post_title' => 'required|string|max:255',
        'post_content' => 'required|string',
        'post_status' => 'in:draft,publish,private',
        'post_type' => 'in:post,page,product',
        'author_id' => 'required|integer|wp_user_exists',
    ];
}

public function prepareForValidation()
{
    $this->merge([
        'post_title' => sanitize_text_field($this->get('post_title')),
        'post_content' => wp_kses_post($this->get('post_content')),
        'author_id' => get_current_user_id(),
    ]);
}
```

### File Upload Validation

```php
public function rules(): array
{
    return [
        'title' => 'required|string|max:255',
        'attachment' => 'required|file|max:2048', // Max 2MB
        'image' => 'file|image|max:1024', // Max 1MB, must be image
    ];
}

public function prepareForValidation()
{
    // Get file parameters from WordPress request
    $files = $this->request->get_file_params();
    
    if (!empty($files)) {
        $this->merge($files);
    }
}
```

## Real-World Examples

### User Registration Request

```php
<?php

namespace App\Http\Requests;

use AvelPress\Http\FormRequest;

class RegisterUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
            'terms' => 'accepted',
            'age' => 'required|integer|min:18',
            'phone' => 'string|max:20',
        ];
    }

    public function prepareForValidation()
    {
        $this->merge([
            'email' => strtolower(trim($this->get('email'))),
            'name' => sanitize_text_field($this->get('name')),
            'phone' => sanitize_text_field($this->get('phone')),
        ]);
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email address is already registered.',
            'password.confirmed' => 'Password confirmation does not match.',
            'terms.accepted' => 'You must accept the terms and conditions.',
            'age.min' => 'You must be at least 18 years old to register.',
        ];
    }
}
```

### Quote Creation Request (from Infixs Mega ERP)

```php
<?php

namespace Infixs\MegaErp\App\Modules\Quote\Http\Requests;

use AvelPress\Http\FormRequest;

class StoreQuoteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'customer' => 'required|array',
            'customer.email' => 'required|email',
            'customer.name' => 'required|string|max:255',
            'customer.type' => 'required|in:individual,company',
            'customer.phone' => 'string|max:20',
            'customer.document' => 'string|max:50',
            
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.discount' => 'numeric|min:0',
            
            'payment_methods' => 'array',
            'payment_methods.*.method_id' => 'required|string',
            'payment_methods.*.discount' => 'numeric|min:0',
            'payment_methods.*.discount_type' => 'in:fixed,percentage',
            
            'expires_in' => 'required|integer|min:1',
            'notes' => 'string|max:1000',
        ];
    }

    public function prepareForValidation()
    {
        $this->merge([
            'customer.email' => sanitize_email($this->get('customer.email')),
            'customer.name' => sanitize_text_field($this->get('customer.name')),
            'customer.type' => sanitize_text_field($this->get('customer.type')),
            'expires_in' => (int) $this->get('expires_in'),
            'notes' => sanitize_textarea_field($this->get('notes')),
        ]);
    }

    public function messages(): array
    {
        return [
            'customer.required' => 'Customer information is required.',
            'customer.email.required' => 'Customer email is required.',
            'customer.email.email' => 'Please provide a valid customer email.',
            'items.required' => 'At least one item is required.',
            'items.min' => 'At least one item is required.',
            'items.*.quantity.min' => 'Item quantity must be at least 1.',
            'expires_in.min' => 'Quote must be valid for at least 1 day.',
        ];
    }
}
```

### Product Update Request

```php
<?php

namespace App\Http\Requests;

use AvelPress\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function rules(): array
    {
        $productId = $this->get_param('id');
        
        return [
            'name' => 'required|string|max:255',
            'slug' => "required|string|max:255|unique:products,slug,{$productId}",
            'description' => 'string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'numeric|min:0|lt:price',
            'sku' => "required|string|max:100|unique:products,sku,{$productId}",
            'stock_quantity' => 'integer|min:0',
            'status' => 'in:draft,published,archived',
            'categories' => 'array',
            'categories.*' => 'integer|exists:categories,id',
            'tags' => 'array',
            'tags.*' => 'string|max:50',
            'weight' => 'numeric|min:0',
            'dimensions' => 'array',
            'dimensions.length' => 'numeric|min:0',
            'dimensions.width' => 'numeric|min:0',
            'dimensions.height' => 'numeric|min:0',
        ];
    }

    public function prepareForValidation()
    {
        $this->merge([
            'name' => sanitize_text_field($this->get('name')),
            'slug' => sanitize_title($this->get('slug') ?: $this->get('name')),
            'description' => wp_kses_post($this->get('description')),
            'sku' => strtoupper(sanitize_text_field($this->get('sku'))),
            'price' => floatval($this->get('price')),
            'sale_price' => floatval($this->get('sale_price')),
            'weight' => floatval($this->get('weight')),
        ]);
    }

    public function messages(): array
    {
        return [
            'slug.unique' => 'This product slug is already taken.',
            'sku.unique' => 'This SKU is already in use.',
            'sale_price.lt' => 'Sale price must be less than regular price.',
        ];
    }
}
```

## Error Handling

When validation fails, AvelPress automatically returns a `WP_Error` response with status code 422:

```json
{
    "code": "validation_error",
    "message": "Validation failed",
    "data": {
        "status": 422,
        "errors": {
            "email": ["The email field is required."],
            "password": ["The password must be at least 8 characters."]
        }
    }
}
```

## Best Practices

### 1. Keep Rules Simple and Clear

```php
// Good
public function rules(): array
{
    return [
        'title' => 'required|string|max:255',
        'content' => 'required|string',
        'status' => 'in:draft,published',
    ];
}

// Avoid complex nested validation in rules method
```

### 2. Use Preparation for Data Cleaning

```php
public function prepareForValidation()
{
    // Clean and format data before validation
    $this->merge([
        'email' => strtolower(trim($this->get('email'))),
        'phone' => preg_replace('/[^0-9+]/', '', $this->get('phone')),
        'title' => sanitize_text_field($this->get('title')),
    ]);
}
```

### 3. Provide Clear Error Messages

```php
public function messages(): array
{
    return [
        'email.required' => 'Please provide your email address.',
        'email.unique' => 'This email is already registered.',
        'password.min' => 'Password must be at least 8 characters long.',
    ];
}
```

### 4. Group Related Validations

```php
// Create separate requests for different operations
class StoreUserRequest extends FormRequest { }
class UpdateUserRequest extends FormRequest { }
class DeleteUserRequest extends FormRequest { }
```

Form Requests in AvelPress provide a clean, organized way to handle request validation while maintaining compatibility with WordPress standards and security practices.
