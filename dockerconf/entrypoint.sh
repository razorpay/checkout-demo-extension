#!/usr/bin/env sh
set -euo pipefail

echo "Creating Log Files"
mkdir -p /var/log/nginx

echo $GIT_COMMIT_HASH > /checkout/app/dist/v1/commit.txt

ALOHOMORA_BIN=$(which alohomora)

$ALOHOMORA_BIN cast --region ap-south-1 --env $APP_MODE --app checkout "/dockerconf/checkout.nginx.conf.j2"
sed -i "s|NGINX_HOST|$HOSTNAME|g" /dockerconf/checkout.nginx.conf
cp /dockerconf/checkout.nginx.conf /etc/nginx/conf.d/checkout.conf

mkdir /run/nginx
touch /run/nginx/nginx.pid
nginx -g 'daemon off;'

