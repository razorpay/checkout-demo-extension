#!/bin/bash
# Deployment Script

# Install new version
rsync -avz --force --delete --progress ./app/dist /home/ubuntu/rfs/app/dist