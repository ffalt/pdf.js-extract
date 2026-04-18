#!/bin/bash

cd scripts || exit

# Clone repo
git clone https://github.com/mozilla/pdf.js pdfjs-temp

# Go into repo folder
cd pdfjs-temp || exit

# Get new tags from the remote
git fetch --tags

# Get the latest tag name, assign it to a variable
latestTag=$(git describe --tags "$(git rev-list --tags --max-count=1)")

# Checkout the latest tag
git checkout $latestTag

# Install dependencies
npm install

# Build PDF.js
./node_modules/.bin/gulp --gulpfile gulpfile.mjs dist || exit

# Copy Built PDF.js files to the library folder (Change VerbosityLevel to ERRORS )
node ../patch.mjs ./build/generic-legacy/build pdf.mjs
node ../patch.mjs ./build/generic-legacy/build pdf.worker.mjs

# Copy License and Version to library
cp ./build/version.json ../../lib/pdfjs/version.json
cp ./LICENSE ../../lib/pdfjs/LICENSE
echo Used version
tail ../../lib/pdfjs/version.json

# cleanup build files
cd .. || exit
rm -Rf pdfjs-temp
