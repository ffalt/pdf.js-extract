# pdf.js-extract

extracts text from PDF files

This is just a library packaged out of the examples for usage of pdf.js with nodejs.

It reads a pdf file and exports all pages & texts with coordinates. This can be e.g. used to extract structured table data.

##Install

[![NPM](https://nodei.co/npm/pdf.js-extract.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/pdf.js-extract/)

[![dependencies](https://img.shields.io/david/ffalt/pdf.js-extract.svg)](https://www.npmjs.com/package/pdf.js-extract)

[![license](https://img.shields.io/npm/l/pdf.js-extract.svg)](http://opensource.org/licenses/MIT)

[![developer](https://img.shields.io/badge/developer-awesome-brightgreen.svg)](https://github.com/ffalt/pdf.js-extract)

##Convenience API

```javascript

    var PDFExtract = require('pdf.js-extract').PDFExtract;
	pdfExtract.extract(filename, {} /* options, currently nothing available*/, function (err, data) {
		if (err) return console.log(err);
		console.log(data);
	});


```

##TODO

docu: utils for table parsing
tests