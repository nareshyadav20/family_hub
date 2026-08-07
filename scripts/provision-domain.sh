#!/bin/bash
set -Eeuo pipefail

# ==========================================
# provision-domain.sh
# Automates Nginx config generation, testing,
# Let's Encrypt SSL generation, and reload.
# ==========================================

# Configuration
TEMPLATE_FILE="/etc/nginx/templates/custom-domain.conf.template"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
DOMAIN_DIR="/var/www/certbot"
WEBROOT_DIR="/var/www/certbot"

# Exit codes
EXIT_SUCCESS=0
EXIT_INVALID_DOMAIN=10
EXIT_DNS_NOT_CONFIGURED=11
EXIT_DNS_LOOKUP_FAILED=12
EXIT_TEMPLATE_FAILED=13
EXIT_ENABLE_SITE_FAILED=14
EXIT_NGINX_TEST_FAILED=15
EXIT_SSL_CERT_FAILED=16
EXIT_NGINX_RELOAD_FAILED=17
EXIT_ROLLBACK_FAILED=18
EXIT_UNKNOWN_ERROR=19

# Domain passed as argument
DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "Error: Domain name is required."
    exit $EXIT_INVALID_DOMAIN
fi

echo "[1/5] Generating Nginx configuration for $DOMAIN..."
CONFIG_FILE="$NGINX_SITES_AVAILABLE/$DOMAIN.conf"
SYMLINK_FILE="$NGINX_SITES_ENABLED/$DOMAIN.conf"

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "Error: Nginx template file not found at $TEMPLATE_FILE"
    exit $EXIT_TEMPLATE_FAILED
fi

sed "s/__DOMAIN__/$DOMAIN/g" "$TEMPLATE_FILE" > "$CONFIG_FILE" || {
    echo "Error: Failed to generate Nginx config."
    exit $EXIT_TEMPLATE_FAILED
}

echo "[2/5] Enabling site..."
ln -sf "$CONFIG_FILE" "$SYMLINK_FILE" || {
    echo "Error: Failed to enable site (symlink)."
    rm -f "$CONFIG_FILE"
    exit $EXIT_ENABLE_SITE_FAILED
}

echo "[3/5] Testing Nginx configuration..."
nginx -t || {
    echo "Error: Nginx configuration test failed. Rolling back..."
    rm -f "$SYMLINK_FILE"
    rm -f "$CONFIG_FILE"
    exit $EXIT_NGINX_TEST_FAILED
}

# Reload Nginx to serve the challenge via HTTP
systemctl reload nginx || {
    echo "Error: Failed to reload Nginx for ACME challenge."
    exit $EXIT_NGINX_RELOAD_FAILED
}

echo "[4/5] Generating Let's Encrypt SSL Certificate..."
# Assuming a webroot plugin configuration for certbot
certbot certonly --webroot -w "$WEBROOT_DIR" -d "$DOMAIN" --non-interactive --agree-tos --email admin@familyhub.com || {
    echo "Error: Certbot failed. Rolling back..."
    
    # ROLLBACK
    rm -f "$SYMLINK_FILE"
    rm -f "$CONFIG_FILE"
    systemctl reload nginx || {
        echo "CRITICAL: Rollback Nginx reload failed!"
        exit $EXIT_ROLLBACK_FAILED
    }
    
    exit $EXIT_SSL_CERT_FAILED
}

echo "[5/5] Reloading Nginx with SSL..."
systemctl reload nginx || {
    echo "Error: Failed to reload Nginx after SSL issue."
    exit $EXIT_NGINX_RELOAD_FAILED
}

echo "Provisioning completed successfully for $DOMAIN."
exit $EXIT_SUCCESS
