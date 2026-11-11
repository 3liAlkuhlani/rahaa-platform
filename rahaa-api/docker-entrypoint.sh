#!/bin/sh
set -e

# Ensure SQLite database exists
if [ ! -f /var/www/database/database.sqlite ]; then
    touch /var/www/database/database.sqlite
fi
chmod 777 /var/www/database/database.sqlite

# Create storage symlink
php artisan storage:link || true

# Run migrations and essential seeders
php artisan migrate --force
php artisan db:seed --class=MultiTransportSeeder --force

# Optimize Laravel
php artisan config:cache
php artisan route:cache

echo "Starting Rahaa API on port ${PORT:-8000}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
