#! /bin/bash

docker run --rm -v $(pwd):/work/:rw -w /work/ --user $(id -u):$(id -g) --env NODE_ENV=production -it mcr.microsoft.com/playwright:v1.27.1-focal ./node_modules/.bin/playwright test $1