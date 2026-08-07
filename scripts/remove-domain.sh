#!/bin/bash
set -Eeuo pipefail

# ==========================================
# remove-domain.sh
# Safely disables a custom domain and removes
# its SSL certificates and Nginx configs.
# ==========================================

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "Error: Domain name is required."
    exit 1
fi

echo "Removing domain $DOMAIN from Nginx..."

# 1. Disable site (remove symlink)
if [ -L "/etc/nginx/sites-enabled/$DOMAIN.conf" ]; then
    rm -f "/etc/nginx/sites-enabled/$DOMAIN.conf"
fi

# 2. Remove configuration file
if [ -f "/etc/nginx/sites-available/$DOMAIN.conf" ]; then
    rm -f "/etc/nginx/sites-available/$DOMAIN.conf"
fi

# 3. Reload Nginx
echo "Reloading Nginx..."
systemctl reload nginx || {
    echo "Warning: Nginx failed to reload after removing $DOMAIN."
}

# 4. Remove Let's Encrypt certificates
echo "Revoking and removing Let's Encrypt certificates..."
certbot delete --cert-name "$DOMAIN" --non-interactive || {
    echo "Warning: Certbot could not delete certs for $DOMAIN. They might already be gone."
}

echo "Removal of $DOMAIN completed successfully."
exit 0
