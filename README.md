# pdf-extract

extracts data from XLSX files with low memory footprint

this is just a library packaged out of the examples for usage of pdf.js with nodejs.

It reads a pdf file and exports all pages & texts with coordinates. This can be e.g. used to extract structured table data.

##Install

[![NPM](https://nodei.co/npm/pdf-extract.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/pdf-extract/)

[![dependencies](https://img.shields.io/david/ffalt/pdf-extract.svg)](https://www.npmjs.com/package/pdf-extract)

[![license](https://img.shields.io/npm/l/pdf-extract.svg)](http://opensource.org/licenses/MIT)

[![developer](https://img.shields.io/badge/developer-awesome-brightgreen.svg)](https://github.com/ffalt/pdf-extract)

##Convenience API

```javascript

    var PDFExtract = require('pdf-extract').PDFExtract;
	pdfExtract.extract(filename, {} /* options, currently nothing available*/, function (err, data) {
		if (err) return console.log(err);
		console.log(data);
	});


```

##TODO

docu: utils for table parsing
tests