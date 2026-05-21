#!/usr/bin/env sh
set -e

cd /var/www/html

chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

if [ -z "$APP_KEY" ]; then
    echo "ERROR: APP_KEY is not set. Configure it in Dokploy or docker-compose."
    exit 1
fi

if [ -n "$DB_HOST" ] && [ "$DB_CONNECTION" != "sqlite" ]; then
    echo "Waiting for database..."
    until php artisan db:show >/dev/null 2>&1; do
        sleep 2
    done
fi

if [ -n "$REDIS_HOST" ]; then
    echo "Waiting for Redis..."
    until php -r "
        \$redis = new Redis();
        \$host = getenv('REDIS_HOST') ?: '127.0.0.1';
        \$port = (int) (getenv('REDIS_PORT') ?: 6379);
        \$redis->connect(\$host, \$port, 2);
        \$password = getenv('REDIS_PASSWORD');
        if (\$password !== false && \$password !== '' && \$password !== 'null') {
            \$redis->auth(\$password);
        }
        \$redis->ping();
    " >/dev/null 2>&1; do
        sleep 2
    done
fi

php artisan storage:link --force 2>/dev/null || true

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force --no-interaction
fi

if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

case "$1" in
    web)
        php-fpm -D
        exec nginx -g 'daemon off;'
        ;;
    queue)
        exec php artisan queue:work \
            --sleep=3 \
            --tries=3 \
            --max-time=3600 \
            --no-interaction
        ;;
    *)
        exec "$@"
        ;;
esac
