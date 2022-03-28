git clone https://github.com/mozilla/pdf.js pdfjs-temp
cd pdfjs-temp
npm install
npm install gulp
./node_modules/.bin/gulp dist-pre
#cp ./build/generic-legacy/build/pdf.js ../lib/pdfjs/pdf.js
#cp ./build/generic-legacy/build/pdf.worker.js ../lib/pdfjs/pdf.worker.js
node -e 'var fs=require("fs");fs.writeFileSync("../lib/pdfjs/pdf.js",fs.readFileSync("./build/generic-legacy/build/pdf.js").toString().replace("var verbosity = VerbosityLevel.WARNINGS","var verbosity = VerbosityLevel.ERRORS"));process.exit()'
node -e 'var fs=require("fs");fs.writeFileSync("../lib/pdfjs/pdf.worker.js",fs.readFileSync("./build/generic-legacy/build/pdf.worker.js").toString().replace("var verbosity = VerbosityLevel.WARNINGS","var verbosity = VerbosityLevel.ERRORS"));process.exit()'
cp ./build/version.json ../lib/pdfjs/version.json
cp ./LICENSE ../lib/pdfjs/LICENSE
echo Used version
tail ./build/version.json
cd ..
rm -Rf pdfjs-temp
