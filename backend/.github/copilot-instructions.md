# AI Coding Guidelines for labprog Django Project

## Project Architecture

This is a Django 6.0.3 project with a single app structure:
- `labprog/` - Project configuration (settings, URLs, wsgi)
- `myapp/` - Main application with models, views, and URLs

Follows Django's MTV (Model-Template-View) pattern. Currently minimal with no models or templates - views return direct HttpResponse.

## Key Files and Patterns

- **URL Configuration**: Root URLs in `labprog/urls.py` include app URLs via `include("myapp.urls")`. App URLs defined in `myapp/urls.py` with function-based views.
- **Views**: Simple function-based views in `myapp/views.py`, e.g., `def home(request): return HttpResponse("...")`
- **Settings**: Standard Django settings in `labprog/settings.py` with DEBUG=True, SQLite database, and 'myapp' in INSTALLED_APPS.

## Development Workflows

- **Run Server**: `python manage.py runserver` (default port 8000)
- **Database**: `python manage.py makemigrations` then `python manage.py migrate` (no migrations applied yet)
- **Admin**: Access at `/admin/` after creating superuser with `python manage.py createsuperuser`
- **Shell**: `python manage.py shell` for interactive Django shell

## Code Conventions

- **Naming**: snake_case for functions/variables, CamelCase for classes (Django standard)
- **Imports**: Standard Django imports at top, app imports use relative (e.g., `from . import views`)
- **URL Patterns**: Use `path()` with name parameter for reverse URL lookup
- **Views**: Return HttpResponse for simple responses; use render() for templates (none used yet)

## Common Patterns

- **App Structure**: Each app has __init__.py, models.py, views.py, urls.py, admin.py, apps.py
- **Settings**: INSTALLED_APPS list includes custom apps; DATABASES uses SQLite by default
- **Middleware**: Standard Django middleware stack in settings

## Known Issues to Address

- Typo in `myapp/urls.py`: `urlpatters` should be `urlpatterns`
- Typo in `myapp/views.py`: "Hellow World!" should be "Hello World!"

## Testing

No tests implemented yet. Use Django's TestCase in `myapp/tests.py` for unit tests.