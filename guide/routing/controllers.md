# Controllers

Controllers are the central hub of your application's request handling logic. In AvelPress, controllers help organize the logic for handling HTTP requests in a clean, organized manner.

## Introduction

Controllers group related request handling logic into a single class. For example, a `UserController` class might handle all incoming requests related to users, including displaying, creating, updating, and deleting users.

Controllers are stored in the `app/Controllers` directory (or `src/app/Controllers` depending on your structure) and extend the base `AvelPress\Routing\Controller` class.

## Basic Controllers

### Creating Controllers

You can create controllers manually or use the AvelPress CLI:

```bash
# Create a basic controller
avel make:controller UserController

# Create a resource controller (with CRUD methods)
avel make:controller PostController --resource
```

### Basic Controller Structure

```php
<?php

namespace App\Controllers;

use AvelPress\Routing\Controller;

class UserController extends Controller
{
    public function index()
    {
        // Return all users
        return ['users' => []];
    }

    public function show($request)
    {
        $id = $request->get_param('id');
        // Return specific user
        return ['user' => ['id' => $id]];
    }
}
```

## Resource Controllers

Resource controllers make it easy to build RESTful controllers around a resource. A resource controller includes methods for the typical "CRUD" operations:

### Generating Resource Controllers

```bash
avel make:controller PhotoController --resource
```

This creates a controller with the following methods:

| Verb   | URI                | Action  | Route Name     |
|--------|--------------------|---------|----------------|
| GET    | `/photos`          | index   | photos.index   |
| POST   | `/photos`          | store   | photos.store   |
| GET    | `/photos/{id}`     | show    | photos.show    |
| PUT    | `/photos/{id}`     | update  | photos.update  |
| DELETE | `/photos/{id}`     | destroy | photos.destroy |

### Resource Controller Example

```php
<?php

namespace App\Controllers;

use App\Models\Photo;
use AvelPress\Routing\Controller;
use AvelPress\Http\Json\JsonResource;

class PhotoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $photos = Photo::all();
        return JsonResource::collection($photos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store($request)
    {
        $photo = Photo::create([
            'title' => $request->get_param('title'),
            'description' => $request->get_param('description'),
            'url' => $request->get_param('url'),
        ]);

        return new JsonResource($photo);
    }

    /**
     * Display the specified resource.
     */
    public function show($request)
    {
        $id = $request->get_param('id');
        $photo = Photo::findOrFail($id);
        
        return new JsonResource($photo);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($request)
    {
        $id = $request->get_param('id');
        $photo = Photo::findOrFail($id);
        
        $photo->update([
            'title' => $request->get_param('title'),
            'description' => $request->get_param('description'),
            'url' => $request->get_param('url'),
        ]);

        return new JsonResource($photo);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($request)
    {
        $id = $request->get_param('id');
        $photo = Photo::findOrFail($id);
        $photo->delete();

        return ['message' => 'Photo deleted successfully'];
    }
}
```

## Request Handling

### Accessing Request Data

Controllers receive the WordPress `WP_REST_Request` object, which provides access to all request data:

```php
public function store($request)
{
    // Get individual parameters
    $title = $request->get_param('title');
    $content = $request->get_param('content');

    // Get all parameters
    $params = $request->get_params();

    // Get JSON body
    $body = $request->get_json_params();

    // Get file uploads
    $files = $request->get_file_params();

    // Get headers
    $authHeader = $request->get_header('authorization');
}
```

### Route Parameters

Access route parameters (like `{id}` in the URL) using the request object:

```php
public function show($request)
{
    $id = $request->get_param('id');
    $user = User::find($id);
    
    if (!$user) {
        return new \WP_Error('user_not_found', 'User not found', ['status' => 404]);
    }
    
    return new JsonResource($user);
}
```

## Dependency Injection

Controllers support automatic dependency injection. You can type-hint dependencies in your controller methods and they will be automatically resolved:

### Service Injection

```php
use App\Services\UserService;

class UserController extends Controller
{
    public function index(UserService $userService)
    {
        $users = $userService->getAllUsers();
        return JsonResource::collection($users);
    }
}
```

### Model Injection

You can also inject models directly:

```php
use App\Models\User;

class UserController extends Controller
{
    public function show(User $user)
    {
        // The $user will be automatically resolved based on route parameter
        return new JsonResource($user);
    }
}
```

### Form Request Injection

Inject form requests for automatic validation:

```php
use App\Http\Requests\StoreUserRequest;

class UserController extends Controller
{
    public function store(StoreUserRequest $request)
    {
        // Request is automatically validated
        $user = User::create($request->validated());
        return new JsonResource($user);
    }
}
```

## Response Handling

### JSON Responses

Return arrays, and they'll be automatically converted to JSON:

```php
public function index()
{
    return [
        'users' => User::all()->toArray(),
        'total' => User::count(),
    ];
}
```

### Resource Responses

Use JSON resources for consistent API responses:

```php
public function show($request)
{
    $user = User::find($request->get_param('id'));
    return new JsonResource($user);
}

public function index()
{
    $users = User::all();
    return JsonResource::collection($users);
}
```

### Custom Status Codes

Return custom HTTP status codes using `WP_REST_Response`:

```php
public function store($request)
{
    $user = User::create($request->get_params());
    
    return new \WP_REST_Response([
        'message' => 'User created successfully',
        'user' => $user->toArray()
    ], 201);
}
```

### Error Responses

Return errors using `WP_Error`:

```php
public function show($request)
{
    $user = User::find($request->get_param('id'));
    
    if (!$user) {
        return new \WP_Error(
            'user_not_found',
            'The requested user was not found',
            ['status' => 404]
        );
    }
    
    return new JsonResource($user);
}
```

## Controller Organization

### Nested Controllers

For complex applications, you can organize controllers in subdirectories:

```
app/Controllers/
├── UserController.php
├── PostController.php
├── Admin/
│   ├── DashboardController.php
│   └── SettingsController.php
└── Api/
    ├── V1/
    │   ├── UserController.php
    │   └── PostController.php
    └── V2/
        └── UserController.php
```

### Controller Namespacing

```php
<?php

namespace App\Controllers\Admin;

use AvelPress\Routing\Controller;

class DashboardController extends Controller
{
    public function index()
    {
        // Admin dashboard logic
    }
}
```

## WordPress Integration

### Accessing WordPress Functions

Controllers have full access to WordPress functions and globals:

```php
public function currentUser()
{
    $current_user = wp_get_current_user();
    
    if ($current_user->ID === 0) {
        return new \WP_Error('not_logged_in', 'User not logged in', ['status' => 401]);
    }
    
    return [
        'id' => $current_user->ID,
        'name' => $current_user->display_name,
        'email' => $current_user->user_email,
        'roles' => $current_user->roles,
    ];
}
```

### Permission Checks

```php
public function adminOnly()
{
    if (!current_user_can('manage_options')) {
        return new \WP_Error(
            'insufficient_permissions',
            'You do not have permission to access this resource',
            ['status' => 403]
        );
    }
    
    // Admin-only logic here
    return ['message' => 'Welcome, admin!'];
}
```

### Working with WordPress Data

```php
public function posts()
{
    $posts = get_posts([
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => 10,
    ]);
    
    return [
        'posts' => array_map(function($post) {
            return [
                'id' => $post->ID,
                'title' => $post->post_title,
                'content' => $post->post_content,
                'date' => $post->post_date,
            ];
        }, $posts)
    ];
}
```

## Advanced Features

### Controller Middleware

You can apply guards (middleware) to specific controller methods:

```php
class UserController extends Controller
{
    public function __construct()
    {
        // Apply authentication to all methods except index and show
        $this->middleware('auth')->except(['index', 'show']);
        
        // Apply admin guard only to destroy method
        $this->middleware('admin')->only(['destroy']);
    }
}
```

### Shared Controller Logic

Create base controllers for shared functionality:

```php
<?php

namespace App\Controllers;

use AvelPress\Routing\Controller;

class BaseController extends Controller
{
    protected function getCurrentUser()
    {
        return wp_get_current_user();
    }
    
    protected function checkPermission($capability)
    {
        if (!current_user_can($capability)) {
            return new \WP_Error(
                'insufficient_permissions',
                'Access denied',
                ['status' => 403]
            );
        }
        
        return true;
    }
}
```

Then extend it in your controllers:

```php
class UserController extends BaseController
{
    public function profile()
    {
        $user = $this->getCurrentUser();
        return new JsonResource($user);
    }
}
```

## Real-World Example

Here's a complete example from the Infixs Mega ERP plugin:

```php
<?php

namespace Infixs\MegaErp\App\Modules\Quote\Http\Controllers;

use AvelPress\Routing\Controller;
use Infixs\MegaErp\App\Modules\Quote\Http\Requests\StoreQuoteRequest;
use Infixs\MegaErp\App\Modules\Quote\Http\Requests\UpdateQuoteRequest;
use Infixs\MegaErp\App\Modules\Quote\Http\Resources\QuoteCollection;
use Infixs\MegaErp\App\Modules\Quote\Http\Resources\QuoteResource;
use Infixs\MegaErp\App\Modules\Quote\Models\Quote;
use Infixs\MegaErp\App\Modules\Quote\Services\QuoteService;

class QuoteController extends Controller
{
    private $quoteService;

    public function __construct(QuoteService $quoteService)
    {
        $this->quoteService = $quoteService;
    }

    public function index()
    {
        $quotes = Quote::with(['items', 'paymentMethods'])->get();
        return new QuoteCollection($quotes);
    }

    public function store(StoreQuoteRequest $request)
    {
        $quote = $this->quoteService->create($request->validated());
        return new QuoteResource($quote);
    }

    public function show($request)
    {
        $quote = Quote::with(['items', 'paymentMethods'])
            ->findOrFail($request->get_param('id'));
        
        return new QuoteResource($quote);
    }

    public function update(UpdateQuoteRequest $request)
    {
        $quote = Quote::findOrFail($request->get_param('id'));
        $quote = $this->quoteService->update($quote, $request->validated());
        
        return new QuoteResource($quote);
    }

    public function destroy($request)
    {
        $quote = Quote::findOrFail($request->get_param('id'));
        $quote->delete();
        
        return ['message' => 'Quote deleted successfully'];
    }
}
```

This example demonstrates:
- Dependency injection (QuoteService)
- Form request validation
- Resource responses
- Model relationships
- Service layer pattern
- RESTful controller structure

Controllers in AvelPress provide a clean, organized way to handle your application's HTTP requests while maintaining full compatibility with WordPress functionality.
