#! /bin/bash

docker run --rm -v $(pwd):/work/:rw -w /work/ --user $(id -u):$(id -g) --env NODE_ENV=production -it mcr.microsoft.com/playwright:v1.22.0-focal npx playwright test