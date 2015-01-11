#!/bin/bash
# Deployment Script

BASEDIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )/../" && pwd )

# Install new version
cd $BASEDIR && rsync -avz --force --delete --progress ./app/dist/ /home/ubuntu/checkout/app/dist/

# Fix permissions
cd /home/ubuntu/checkout/app/dist/ && sudo chmod 775 -R ./