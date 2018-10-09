const fs = require('fs');
const assert = require('assert');
const PDFExtract = require('../lib/').PDFExtract;
const pdfExtract = new PDFExtract();
const buffer = fs.readFileSync('./example.pdf');
pdfExtract.extractBuffer(buffer, {}, (err, data) => {
	if (err) {
		return console.error(err);
	}
	const expected = require('./example-output.json');
	assert.deepEqual(data.meta, expected.meta);
	assert.deepEqual(data.pages, expected.pages);
});
