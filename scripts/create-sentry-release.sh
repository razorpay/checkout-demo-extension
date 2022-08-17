#!/bin/bash
set -e

# Download build files
mkdir -p build

BUCKET="rzp-1415-prod-checkout-static"
aws --output text s3 sync s3://${BUCKET}/build/${COMMIT_ID} build

# Install Sentry CLI
curl -sL https://sentry.io/get-cli/ | bash

# Get app version
APP_VERSION=$(sentry-cli releases propose-version)

# Create a new release
sentry-cli releases new $APP_VERSION

# Upload sourcemaps
sentry-cli releases files $APP_VERSION upload-sourcemaps build/*.map

# Commit Integration
sentry-cli releases set-commits --auto $APP_VERSION

# Finalize the release
sentry-cli releases finalize $APP_VERSION

# Associate deploy with release
sentry-cli releases deploys $APP_VERSION new -e $APP_ENV
