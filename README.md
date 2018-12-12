# pdf.js-extract

extracts text from PDF files

This is just a library packaged out of the examples for usage of pdf.js with nodejs.

It reads a pdf file and exports all pages & texts with coordinates. This can be e.g. used to extract structured table data.

This package includes a build of [pdf.js](https://github.com/mozilla/pdf.js). why? [pdfs-dist](https://github.com/mozilla/pdfjs-dist) installs not needed dependencies into production deployment.

Note: NO OCR!

## Install

[![NPM](https://nodei.co/npm/pdf.js-extract.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/pdf.js-extract/)

[![Build Status](https://travis-ci.org/ffalt/pdf.js-extract.svg?branch=master)](https://travis-ci.org/ffalt/pdf.js-extract)
[![license](https://img.shields.io/npm/l/pdf.js-extract.svg)](http://opensource.org/licenses/MIT) 
[![Greenkeeper badge](https://badges.greenkeeper.io/ffalt/pdf.js-extract.svg)](https://greenkeeper.io/)

## Convenience API

```javascript
const PDFExtract = require('pdf.js-extract').PDFExtract;
// import {PDFExtract} from 'pdf.js-extract'; // or with typescript
const pdfExtract = new PDFExtract();
const options = {}; /* see below */
pdfExtract.extract(filename, options, (err, data) => {
    if (err) return console.log(err);
    console.log(data);
});
```

## Options
```typescript
export interface PDFExtractOptions {
    firstPage?: number; // default:`1` - start extract at page nr
    lastPage?: number; //  stop extract at page nr, no default value
    password?: string; //  for decrypting password-protected PDFs., no default value
    verbosity?: number; // default:`-1` - log level of pdf.js
    normalizeWhitespace?: boolean; // default:`false` - replaces all occurrences of whitespace with standard spaces (0x20).
    disableCombineTextItems?: boolean; // default:`false` - do not attempt to combine  same line {@link TextItem}'s.
}
```

Example Output

```javascript
{
	"filename": "helloworld.pdf",
	"meta": {
		"info": {
			"PDFFormatVersion": "1.7",
			"IsAcroFormPresent": false,
			"IsXFAPresent": false
		},
		"metadata": null
	},
	"pages": [
		{
			"pageInfo": {
				"num": 1,
				"scale": 1,
				"rotation": 0,
				"offsetX": 0,
				"offsetY": 0,
				"width": 200,
				"height": 200
			},
			"content": [
				{
					"x": 70,
					"y": 150,
					"str": "Hello, world!",
					"dir": "ltr",
					"width": 64.656,
					"height": 12,
					"fontName": "Times"
				}
			]
		}
	],
	"pdfInfo": {
		"numPages": 1,
		"fingerprint": "1ee9219eb9eaa49acbfc20155ac359c3"
	}
}
```


## TODO

-  docu: utils for table parsing
-  es6: offer Promise api, e.g. `extractBufferAsync(...):  Promise<PDFExtractResult>`
