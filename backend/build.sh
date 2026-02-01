#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

# Sync initial migrations
python manage.py migrate --fake-initial

# Fake the problematic contenttypes migration
python manage.py migrate contenttypes 0002 --fake

# Now apply remaining migrations safely
python manage.py migrate

# Load initial data (ONLY if tables are ready)
python manage.py loaddata data.json
