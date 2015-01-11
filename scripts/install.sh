#!/bin/bash
# Deployment Script

# Install new version
rsync -avz --force --delete --progress ./ /home/ubuntu/checkout/