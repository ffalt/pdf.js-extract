git clone https://github.com/mozilla/pdf.js pdfjs-temp
cd pdfjs-temp
npm install
npm install gulp
./node_modules/.bin/gulp dist-pre
#cp ./build/dist/build/pdf.js ../lib/pdfjs/pdf.js
#cp ./build/dist/build/pdf.worker.js ../lib/pdfjs/pdf.worker.js
node -e 'var fs=require("fs");fs.writeFileSync("../lib/pdfjs/pdf.js",fs.readFileSync("./build/dist/build/pdf.js").toString().replace("verbosity = VerbosityLevel.WARNINGS","verbosity = VerbosityLevel.ERRORS").replace("node-ensure","./ensure.js"));process.exit()'
node -e 'var fs=require("fs");fs.writeFileSync("../lib/pdfjs/pdf.worker.js",fs.readFileSync("./build/dist/build/pdf.worker.js").toString().replace("verbosity = VerbosityLevel.WARNINGS","verbosity = VerbosityLevel.ERRORS"));process.exit()'
cp ./build/version.json ../lib/pdfjs/version.json
cp ./LICENSE ../lib/pdfjs/LICENSE
echo Used version
tail ./build/version.json
cd ..
rm -Rf pdfjs-temp
