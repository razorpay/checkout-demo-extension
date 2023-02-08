#! /bin/bash

mkdir -p "dist"
mkdir -p "dist/scripts"

cp ./manifest.json ./dist
cp ./scripts/checkout.js ./dist/scripts
cp -R ./assets ./dist