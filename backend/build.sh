#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate --fake-initial

# Load initial data into database (products, categories, users)
python manage.py loaddata data.json 
