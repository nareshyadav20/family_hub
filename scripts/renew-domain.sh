#!/bin/bash
set -Eeuo pipefail

# ==========================================
# renew-domain.sh
# Manually triggers a renewal for a specific domain.
# (Note: Certbot typically runs automatically via systemd/cron)
# ==========================================

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "Error: Domain name is required."
    exit 1
fi

echo "Attempting to renew SSL certificate for $DOMAIN..."
certbot renew --cert-name "$DOMAIN" --non-interactive --force-renewal || {
    echo "Error: Failed to renew certificate for $DOMAIN."
    exit 2
}

echo "Reloading Nginx to apply new certificates..."
systemctl reload nginx || {
    echo "Error: Failed to reload Nginx after renewal."
    exit 3
}

echo "Renewal completed successfully for $DOMAIN."
exit 0
