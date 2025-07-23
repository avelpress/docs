# AvelPress Documentation

This directory contains the complete documentation for the AvelPress framework, built with VitePress.

## Documentation Structure

```
docs/
├── .vitepress/
│   └── config.js          # VitePress configuration
├── guide/                 # User guides and tutorials
│   ├── introduction.md
│   ├── installation.md
│   ├── getting-started.md
│   ├── configuration.md
│   ├── routing/
│   │   └── basic.md
│   └── database/
│       ├── getting-started.md
│       ├── eloquent.md
│       └── migrations.md
├── api/                   # API reference documentation
│   ├── overview.md
│   └── model.md
├── examples/              # Complete examples and tutorials
│   └── basic-plugin.md
├── faq.md                 # Frequently asked questions
└── index.md               # Homepage
```

## Running the Documentation

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
npm install vitepress
```

### Development

```bash
# Start development server
npx vitepress dev

# Or if you have VitePress installed globally
vitepress dev
```

The documentation will be available at `http://localhost:5173`

### Building for Production

```bash
# Build static files
npx vitepress build

# Preview production build
npx vitepress preview
```

## Documentation Features

### What's Included

- **Complete User Guide**: From installation to advanced usage
- **API Reference**: Detailed documentation of all classes and methods
- **Practical Examples**: Real-world plugin examples
- **FAQ**: Common questions and troubleshooting
- **Search**: Built-in search functionality
- **Responsive Design**: Works on all devices
- **Dark Mode**: Automatic dark/light theme switching

### Key Sections

1. **Introduction**: Overview of AvelPress and its benefits
2. **Installation**: Step-by-step setup instructions
3. **Getting Started**: Build your first AvelPress plugin
4. **Core Concepts**: Service providers, dependency injection, facades
5. **Routing**: REST API endpoint creation and management
6. **Database**: Models, migrations, and query building
7. **Examples**: Complete working examples
8. **API Reference**: Comprehensive method documentation

## Contributing to Documentation

### Guidelines

1. **Clarity**: Write clear, concise explanations
2. **Examples**: Include practical code examples
3. **Completeness**: Cover all aspects of a feature
4. **Accuracy**: Ensure all code examples work
5. **Consistency**: Follow the established style and structure

### Adding New Pages

1. Create a new `.md` file in the appropriate directory
2. Add the page to the sidebar in `.vitepress/config.js`
3. Follow the existing formatting conventions
4. Include relevant examples and use cases

### Updating Existing Content

1. Keep examples up to date with framework changes
2. Add new features and methods as they're developed
3. Improve explanations based on user feedback
4. Fix any broken links or outdated information

## Framework Coverage

This documentation covers all aspects of the AvelPress framework:

### Core Framework
- Application initialization and bootstrapping
- Service container and dependency injection
- Configuration management
- Service providers

### Routing System
- Route definition and registration
- Controllers and actions
- Route groups and prefixes
- Middleware and guards

### Database Layer
- Eloquent-style models
- Query builder
- Database migrations
- Schema definition
- Relationships

### HTTP Layer
- JSON resources and collections
- Request handling
- Response formatting
- Validation

### WordPress Integration
- REST API integration
- Hook and filter system
- User authentication
- Permission checks

## Maintenance

### Regular Updates

- Update examples when framework APIs change
- Add documentation for new features
- Improve existing explanations based on user feedback
- Keep installation and setup instructions current

### Quality Assurance

- Test all code examples regularly
- Verify links and references
- Check for typos and formatting issues
- Ensure examples work with latest WordPress versions

## Support

For questions about the documentation:

1. Check the FAQ section first
2. Search existing GitHub issues
3. Create a new issue with the "documentation" label
4. Include specific suggestions for improvement

## License

This documentation is part of the AvelPress project and follows the same license terms.

---

**Note**: This documentation is built with VitePress and follows modern documentation best practices. It's designed to be comprehensive yet easy to navigate, with practical examples and clear explanations suitable for developers of all experience levels.
