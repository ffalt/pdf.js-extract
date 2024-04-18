# Clone repo
git clone https://github.com/mozilla/pdf.js pdfjs-temp

# Go into repo folder
cd pdfjs-temp

# Get new tags from the remote
git fetch --tags

# Get the latest tag name, assign it to a variable
latestTag=$(git describe --tags "$(git rev-list --tags --max-count=1)")

# Checkout the latest tag
git checkout $latestTag

# Install dependancies
npm install

# Build PDF.js
# npm install gulp-cli
# ./node_modules/.bin/gulp --gulpfile gulpfile.mjs dist-pre
npx gulp-cli --gulpfile gulpfile.mjs dist-pre

# Copy Built PDF.js files to the library folder (Change VerbosityLevel to ERRORS )
node -e 'var fs=require("fs");fs.writeFileSync("../lib/pdfjs/pdf.mjs",fs.readFileSync("./build/generic-legacy/build/pdf.mjs").toString().replace("let verbosity = VerbosityLevel.WARNINGS","let verbosity = VerbosityLevel.ERRORS"));process.exit()'
node -e 'var fs=require("fs");fs.writeFileSync("../lib/pdfjs/pdf.worker.mjs",fs.readFileSync("./build/generic-legacy/build/pdf.worker.mjs").toString().replace("let verbosity = VerbosityLevel.WARNINGS","let verbosity = VerbosityLevel.ERRORS"));process.exit()'

# Copy License and Version to library
cp ./build/version.json ../lib/pdfjs/version.json
cp ./LICENSE ../lib/pdfjs/LICENSE
echo Used version
tail ./build/version.json

# cleanup unused build files
cd ..
rm -Rf pdfjs-temp
