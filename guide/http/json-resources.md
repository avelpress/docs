# JSON Resources

JSON Resources provide a transformation layer between your Eloquent models and the JSON responses sent to your application's API consumers. They allow you to control exactly how your models and model collections are serialized to JSON.

## Introduction

Resources sit between your models and controllers, allowing you to transform your models into JSON in a consistent, reusable way. This is especially useful for APIs where you need to control what data is exposed and how it's formatted.

## Basic Resources

### Creating Resources

Create resource classes manually in your `app/Http/Resources` directory:

```php
<?php

namespace App\Http\Resources;

use AvelPress\Http\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### Using Resources

Use resources in your controllers:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

class UserController extends Controller
{
    public function show($request)
    {
        $user = User::find($request->get_param('id'));
        return new UserResource($user);
    }

    public function index()
    {
        $users = User::all();
        return UserResource::collection($users);
    }
}
```

## Resource Collections

### Automatic Collections

Use the `collection` method to transform collections of models:

```php
public function index()
{
    $users = User::all();
    
    // This automatically wraps each user in a UserResource
    return UserResource::collection($users);
}
```

### Custom Collection Classes

For more control over collections, create dedicated collection classes:

```php
<?php

namespace App\Http\Resources;

use AvelPress\Http\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     */
    public function toArray(): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->collection->count(),
                'fetched_at' => current_time('mysql'),
            ],
        ];
    }
}
```

Using custom collections:

```php
public function index()
{
    $users = User::all();
    return new UserCollection($users);
}
```

## Data Transformation

### Basic Transformations

Transform model attributes in various ways:

```php
class PostResource extends JsonResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => wp_trim_words($this->content, 50), // Excerpt
            'status' => ucfirst($this->status), // Capitalize
            'published_at' => $this->created_at,
            'author' => [
                'id' => $this->author_id,
                'name' => $this->author_name,
            ],
            'url' => home_url("/posts/{$this->slug}"),
            'edit_url' => admin_url("post.php?post={$this->id}&action=edit"),
        ];
    }
}
```

### Conditional Attributes

Include attributes conditionally:

```php
class UserResource extends JsonResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            
            // Only include admin fields if user is admin
            'role' => $this->when(current_user_can('manage_options'), $this->role),
            'permissions' => $this->when(current_user_can('manage_options'), $this->permissions),
            
            // Include sensitive data only for the user themselves
            'phone' => $this->when($this->id === get_current_user_id(), $this->phone),
            'address' => $this->when($this->id === get_current_user_id(), $this->address),
            
            'created_at' => $this->created_at,
        ];
    }
}
```

### Computed Properties

Add computed properties that don't exist on the model:

```php
class ProductResource extends JsonResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'price' => $this->price,
            'sale_price' => $this->sale_price,
            
            // Computed properties
            'is_on_sale' => $this->sale_price > 0 && $this->sale_price < $this->price,
            'discount_percentage' => $this->calculateDiscountPercentage(),
            'price_formatted' => wc_price($this->price),
            'availability' => $this->stock_quantity > 0 ? 'in_stock' : 'out_of_stock',
            'rating_average' => $this->reviews()->avg('rating'),
            'total_sales' => $this->getTotalSales(),
        ];
    }

    private function calculateDiscountPercentage()
    {
        if ($this->sale_price > 0 && $this->price > 0) {
            return round((($this->price - $this->sale_price) / $this->price) * 100, 2);
        }
        return 0;
    }
}
```

## Relationships

### Including Related Data

Transform related models using their own resources:

```php
class PostResource extends JsonResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            
            // Include author as a resource
            'author' => new UserResource($this->author),
            
            // Include category as a resource
            'category' => new CategoryResource($this->category),
            
            // Include comments collection
            'comments' => CommentResource::collection($this->comments),
            
            // Include tags
            'tags' => TagResource::collection($this->tags),
        ];
    }
}
```

### Conditional Relationships

Load relationships conditionally to avoid N+1 queries:

```php
class PostResource extends JsonResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            
            // Only include author if loaded
            'author' => $this->whenLoaded('author', function () {
                return new UserResource($this->author);
            }),
            
            // Include comments only if requested
            'comments' => $this->when(
                request()->get('include_comments'),
                CommentResource::collection($this->comments)
            ),
            
            // Include metadata only for authenticated users
            'meta' => $this->when(is_user_logged_in(), [
                'views' => $this->view_count,
                'likes' => $this->like_count,
            ]),
        ];
    }
}
```

## WordPress Integration

### WordPress-Specific Resources

Create resources that work with WordPress data:

```php
class WPPostResource extends JsonResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->ID,
            'title' => $this->post_title,
            'content' => apply_filters('the_content', $this->post_content),
            'excerpt' => get_the_excerpt($this->ID),
            'slug' => $this->post_name,
            'status' => $this->post_status,
            'type' => $this->post_type,
            'published_at' => $this->post_date,
            'modified_at' => $this->post_modified,
            
            // WordPress-specific data
            'permalink' => get_permalink($this->ID),
            'edit_link' => get_edit_post_link($this->ID),
            'featured_image' => $this->getFeaturedImage(),
            'author' => $this->getAuthorData(),
            'categories' => $this->getCategories(),
            'tags' => $this->getTags(),
            'meta' => $this->getMetaData(),
        ];
    }

    private function getFeaturedImage()
    {
        $thumbnail_id = get_post_thumbnail_id($this->ID);
        if ($thumbnail_id) {
            return [
                'id' => $thumbnail_id,
                'url' => wp_get_attachment_image_url($thumbnail_id, 'full'),
                'thumbnail' => wp_get_attachment_image_url($thumbnail_id, 'thumbnail'),
                'alt' => get_post_meta($thumbnail_id, '_wp_attachment_image_alt', true),
            ];
        }
        return null;
    }

    private function getAuthorData()
    {
        $author = get_user_by('id', $this->post_author);
        return [
            'id' => $author->ID,
            'name' => $author->display_name,
            'avatar' => get_avatar_url($author->ID),
            'bio' => get_user_meta($author->ID, 'description', true),
        ];
    }
}
```

### Custom Field Resources

Handle ACF or custom fields:

```php
class PageResource extends JsonResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            
            // ACF fields
            'hero_section' => $this->getHeroSection(),
            'features' => $this->getFeatures(),
            'testimonials' => $this->getTestimonials(),
            
            // Custom meta
            'seo' => $this->getSeoData(),
        ];
    }

    private function getHeroSection()
    {
        return [
            'title' => get_field('hero_title', $this->id),
            'subtitle' => get_field('hero_subtitle', $this->id),
            'background_image' => $this->getImageField('hero_background'),
            'cta_button' => get_field('hero_cta', $this->id),
        ];
    }

    private function getImageField($field_name)
    {
        $image = get_field($field_name, $this->id);
        if ($image) {
            return [
                'url' => $image['url'],
                'alt' => $image['alt'],
                'width' => $image['width'],
                'height' => $image['height'],
            ];
        }
        return null;
    }
}
```

## Real-World Examples

### Quote Resource (from Infixs Mega ERP)

```php
<?php

namespace Infixs\MegaErp\App\Modules\Quote\Http\Resources;

use AvelPress\Http\Json\JsonResource;

class QuoteResource extends JsonResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'customer' => [
                'id' => $this->customer_id,
                'name' => $this->customer_name,
                'email' => $this->customer_email,
                'phone' => $this->customer_phone,
                'type' => $this->customer_type,
                'document' => $this->customer_document,
            ],
            'items' => QuoteItemResource::collection($this->whenLoaded('items')),
            'payment_methods' => QuotePaymentMethodResource::collection($this->whenLoaded('paymentMethods')),
            'totals' => [
                'subtotal' => $this->calculateSubtotal(),
                'discount' => $this->calculateDiscount(),
                'total' => $this->calculateTotal(),
            ],
            'status' => $this->status,
            'notes' => $this->notes,
            'valid_until' => $this->valid_until,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            
            // Links
            'links' => [
                'self' => "/wp-json/infixs-mega-erp/v1/quotes/{$this->id}",
                'pdf' => "/wp-json/infixs-mega-erp/v1/quotes/{$this->id}/pdf",
                'edit' => admin_url("admin.php?page=quote-edit&id={$this->id}"),
            ],
        ];
    }

    private function calculateSubtotal()
    {
        return $this->items->sum(function ($item) {
            return $item->quantity * $item->price;
        });
    }

    private function calculateDiscount()
    {
        return $this->items->sum(function ($item) {
            return $item->discount;
        });
    }

    private function calculateTotal()
    {
        return $this->calculateSubtotal() - $this->calculateDiscount();
    }
}
```

### Product Resource with WooCommerce Integration

```php
class ProductResource extends JsonResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            
            // Pricing
            'price' => $this->price,
            'regular_price' => $this->regular_price,
            'sale_price' => $this->sale_price,
            'price_formatted' => wc_price($this->price),
            'on_sale' => $this->is_on_sale(),
            
            // Stock
            'sku' => $this->sku,
            'stock_quantity' => $this->stock_quantity,
            'stock_status' => $this->stock_status,
            'manage_stock' => $this->manage_stock,
            'in_stock' => $this->is_in_stock(),
            
            // Images
            'images' => $this->getProductImages(),
            'featured_image' => $this->getFeaturedImage(),
            
            // Categories and tags
            'categories' => $this->getProductCategories(),
            'tags' => $this->getProductTags(),
            
            // Attributes
            'attributes' => $this->getProductAttributes(),
            'variations' => $this->when($this->is_type('variable'), 
                ProductVariationResource::collection($this->get_available_variations())
            ),
            
            // URLs
            'permalink' => get_permalink($this->id),
            'add_to_cart_url' => $this->add_to_cart_url(),
            
            // Metadata
            'weight' => $this->weight,
            'dimensions' => [
                'length' => $this->length,
                'width' => $this->width,
                'height' => $this->height,
            ],
            'shipping_class' => $this->shipping_class,
            
            'created_at' => $this->date_created->format('Y-m-d H:i:s'),
            'updated_at' => $this->date_modified->format('Y-m-d H:i:s'),
        ];
    }

    private function getProductImages()
    {
        $images = [];
        $attachment_ids = $this->get_gallery_image_ids();
        
        foreach ($attachment_ids as $attachment_id) {
            $images[] = [
                'id' => $attachment_id,
                'src' => wp_get_attachment_image_url($attachment_id, 'full'),
                'thumbnail' => wp_get_attachment_image_url($attachment_id, 'thumbnail'),
                'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
            ];
        }
        
        return $images;
    }
}
```

## Best Practices

### 1. Keep Resources Focused

```php
// Good - focused on what the API consumer needs
class UserResource extends JsonResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar_url,
        ];
    }
}

// Avoid - exposing internal/sensitive data
class UserResource extends JsonResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'password' => $this->password, // Never expose!
            'internal_notes' => $this->internal_notes, // Internal only
            // ... all model attributes
        ];
    }
}
```

### 2. Use Conditional Loading

```php
public function toArray(): array
{
    return [
        'id' => $this->id,
        'title' => $this->title,
        
        // Only load when explicitly requested
        'author' => $this->whenLoaded('author', function () {
            return new UserResource($this->author);
        }),
        
        // Only include for authenticated users
        'edit_url' => $this->when(is_user_logged_in(), 
            admin_url("post.php?post={$this->id}&action=edit")
        ),
    ];
}
```

### 3. Normalize Data Formats

```php
public function toArray(): array
{
    return [
        'id' => $this->id,
        'title' => $this->title,
        
        // Consistent date format
        'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        
        // Consistent boolean format
        'is_active' => (bool) $this->active,
        'is_featured' => (bool) $this->featured,
        
        // Consistent number format
        'price' => (float) $this->price,
        'quantity' => (int) $this->quantity,
    ];
}
```

### 4. Provide Useful Metadata

```php
class PostCollection extends ResourceCollection
{
    public function toArray(): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->collection->count(),
                'page' => request()->get('page', 1),
                'per_page' => request()->get('per_page', 15),
                'generated_at' => current_time('mysql'),
                'cache_expires' => current_time('mysql', 1) + 3600, // 1 hour
            ],
            'links' => [
                'self' => request()->url(),
                'first' => $this->generatePageUrl(1),
                'prev' => $this->generatePrevPageUrl(),
                'next' => $this->generateNextPageUrl(),
            ],
        ];
    }
}
```

JSON Resources in AvelPress provide a powerful way to transform your data into consistent, well-structured API responses while maintaining full control over what data is exposed and how it's formatted.
