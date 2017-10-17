git clone https://github.com/mozilla/pdf.js pdfjs-temp
cd pdfjs-temp
npm install
npm install gulp
./node_modules/.bin/gulp dist-pre
cp ./build/dist/build/pdf.combined.js ../lib/pdfjs/pdf.combined.js
cp ./pdfjs.config ../lib/pdfjs/pdfjs.version
cp ./LICENSE ../lib/pdfjs/LICENSE
echo Used version
tail pdfjs.config
cd ..
rm -Rf pdfjs-temp
