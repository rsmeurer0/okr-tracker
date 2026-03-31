# OKR Tracker

## Project Overview
Whitelabel, multi-tenant OKR Tracker web app. Each organization gets its own space with users, objectives, and key results. A super-admin panel manages orgs and users.

## Tech Stack
- Python 3.12, Flask, Flask-SQLAlchemy, Flask-Login, Flask-Migrate
- PostgreSQL (dev DB: okr_tracker, user: okr_user, password: okr_pass)
- Jinja2 templates + Bootstrap 5
- pytest for testing

## Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
sudo service postgresql start
flask db upgrade
```

## Run
```bash
source .venv/bin/activate
flask run --debug    # dev server at http://127.0.0.1:5000
pytest               # run all tests
pytest tests/test_models.py -v  # single file
flask db migrate -m "description"  # create migration
flask db upgrade                   # apply migrations
```

## Project Structure
```
okr_tracker/        # Main app package
  __init__.py       # App factory: create_app()
  config.py         # Dev/test/prod config classes
  models/           # SQLAlchemy models (org, user, objective, key_result)
  routes/           # Flask blueprints (admin, auth, objectives, key_results, dashboard)
  templates/        # Jinja2 HTML templates
  static/           # CSS/JS assets
tests/              # pytest tests
migrations/         # Flask-Migrate (Alembic) files
```

## Multi-Tenancy
All tenant-scoped queries filter by `org_id`. Admin blueprint bypasses this for super_admin users.

## User Roles
- `super_admin` — access to admin panel, manages all orgs/users
- `org_admin` — manages users within their org
- `member` — regular user within their org

## Conventions
- Commit messages: imperative mood, under 72 chars (e.g. "Add objective CRUD routes")
- Branch naming: `feature/short-description` or `fix/short-description`
- Every model change needs a Flask-Migrate migration
