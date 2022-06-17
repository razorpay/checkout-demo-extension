#!/bin/bash
set -e

BUCKET_canary="rzp-1415-prod-checkout-static-canary"
BUCKET_baseline="rzp-1415-prod-checkout-static-baseline"
BUCKET_production="rzp-1415-prod-checkout-static"

DIST_canary="E2RK6LAT9F78JF"
DIST_baseline="E2C4TJ1SGQAY82"
DIST_production="E10EFYGUV7S9YQ"

deploy_to_env() {
  ENV=$1

  # make a copy of build folder
  rm -rf envbuild
  cp -r build envbuild

  # put env in copied file
  find envbuild -name '*.js' -exec sed -i -- "s#__S_TRAFFIC_ENV__#$ENV#g" {} \;

  # calculate target bucket using passed env
  BUCKET="BUCKET_$ENV"
  BUCKET=${!BUCKET}

  # copy result to env specific bucket
  aws --output text s3 sync envbuild s3://$BUCKET/v1 --cache-control "max-age=120, s-maxage=300"

  # invalidate
  DIST="DIST_$ENV"
  DIST=${!DIST}

  aws --output text cloudfront create-invalidation --distribution-id $DIST --paths "/v1/*"
}

COMMIT=$1
CANARY=$2
BASELINE=$3
PRODUCTION=$4

# copy build folder to disk
aws --output text s3 sync s3://$BUCKET_production/build/$COMMIT build

if [ "$CANARY" == "yes" ]; then
  deploy_to_env "canary"
fi

if [ "$BASELINE" == "yes" ]; then
  deploy_to_env "baseline"
fi

if [ "$PRODUCTION" == "yes" ]; then
  deploy_to_env "production"
fi
