#!/usr/bin/env sh
set -euo pipefail

if [[ "${APP_MODE}" == "dev" ]]; then
  echo $GIT_COMMIT_HASH > /checkout/app/dist/v1/commit.txt
else
  echo $GIT_COMMIT_HASH > /app/dist/v1/commit.txt
fi

alohomora cast --region ap-south-1 --env $APP_MODE --app checkout "/dockerconf/checkout.nginx.conf.j2"

echo "starting nginx"
nginx -c /dockerconf/checkout.nginx.conf -g 'daemon off;'
