#!/usr/bin/env sh
set -euo pipefail

echo "Creating Log Files"
mkdir -p /var/log/nginx

if [[ "${APP_MODE}" == "dev" ]]; then
    echo $GIT_COMMIT_HASH > /checkout/app/dist/v1/commit.txt
    chown -R nginx.nginx /checkout/app/dist
else
    echo $GIT_COMMIT_HASH > /app/dist/v1/commit.txt
fi

ALOHOMORA_BIN=$(which alohomora)

$ALOHOMORA_BIN cast --region ap-south-1 --env $APP_MODE --app checkout "/dockerconf/checkout.nginx.conf.j2"
sed -i "s|NGINX_HOST|$HOSTNAME|g" /dockerconf/checkout.nginx.conf
cp /dockerconf/checkout.nginx.conf /etc/nginx/conf.d/checkout.conf

mkdir /run/nginx
touch /run/nginx/nginx.pid
echo "starting nginx"
nginx -g 'daemon off;'

