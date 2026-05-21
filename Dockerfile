# syntax=docker/dockerfile:1

FROM php:8.4-fpm-bookworm AS php-base

RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip curl nginx \
    libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
    libzip-dev libicu-dev libxml2-dev libonig-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql gd zip intl mbstring bcmath opcache exif \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# ---- Composer + Wayfinder (required before Vite build) ----
FROM php-base AS vendor

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer install --no-dev --optimize-autoloader \
    && APP_KEY=base64:ZGV2ZWxvcG1lbnRrZXlmb3Jkb2NrZXJidWlsZG9ubHl5 \
    php artisan wayfinder:generate --no-interaction

# ---- Frontend assets ----
FROM node:22-bookworm AS frontend

WORKDIR /var/www/html

# Producción: solo npm (package-lock.json debe estar en sync con package.json)
COPY package.json package-lock.json ./
COPY docker/npmrc.build ./.npmrc

RUN npm ci --include=optional

COPY --from=vendor /var/www/html/vendor ./vendor
COPY --from=vendor /var/www/html/resources/js/routes ./resources/js/routes
COPY --from=vendor /var/www/html/resources/js/actions ./resources/js/actions
COPY --from=vendor /var/www/html/resources/js/wayfinder ./resources/js/wayfinder

COPY vite.config.ts tsconfig.json ./
COPY resources ./resources
COPY public ./public

RUN npm run build

# ---- Production image ----
FROM php-base AS production

COPY --from=vendor /var/www/html /var/www/html
COPY --from=frontend /var/www/html/public/build /var/www/html/public/build

COPY docker/nginx/default.conf /etc/nginx/sites-available/default
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-laravel.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default \
    && rm -f /etc/nginx/sites-enabled/default.bak 2>/dev/null || true \
    && chmod +x /usr/local/bin/entrypoint.sh \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
    CMD curl -fsS http://127.0.0.1/up || exit 1

ENTRYPOINT ["entrypoint.sh"]
CMD ["web"]
