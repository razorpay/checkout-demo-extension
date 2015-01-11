#!/bin/bash
# Deployment Script

SCRIPTPATH=$(dirname "$SCRIPT")

# Install new version
rsync -avz --force --delete --progress $SCRIPTPATH/../app/dist/ /home/ubuntu/checkout/app/dist/

# Fix permissions
cd /home/ubuntu/checkout/app/dist/ && sudo chmod 775 -R ./