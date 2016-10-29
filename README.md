# pdf.js-extract

extracts text from PDF files

This is just a library packaged out of the examples for usage of pdf.js with nodejs.

It reads a pdf file and exports all pages & texts with coordinates. This can be e.g. used to extract structured table data.

Note: NO OCR!

##Install

[![NPM](https://nodei.co/npm/pdf.js-extract.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/pdf.js-extract/)

[![dependencies](https://img.shields.io/david/ffalt/pdf.js-extract.svg)](https://www.npmjs.com/package/pdf.js-extract)

[![license](https://img.shields.io/npm/l/pdf.js-extract.svg)](http://opensource.org/licenses/MIT)

[![developer](https://img.shields.io/badge/developer-awesome-brightgreen.svg)](https://github.com/ffalt/pdf.js-extract)

##Convenience API

```javascript

    var PDFExtract = require('pdf.js-extract').PDFExtract;
	var pdfExtract = new PDFExtract();
    pdfExtract.extract(filename, {} /* options, currently nothing available*/, function (err, data) {
		if (err) return console.log(err);
		console.log(data);
	});


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
				"height": 200,
				"fontScale": 1
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
		"fingerprint": "1ee9219eb9eaa49acbfc20155ac359c3",
		"encrypted": false
	}
}
```



##TODO

docu: utils for table parsing

tests