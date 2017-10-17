var fs = require('fs');
var PDFExtract = require('../lib').PDFExtract;
var pdfExtract = new PDFExtract();
pdfExtract.extract('./example.pdf', {} /* options, currently nothing available*/, function (err, data) {
	if (err) return console.log(err);
	fs.writeFileSync('./example-output.json', JSON.stringify(data, null, '\t'));
	console.log(JSON.stringify(data, null, '\t'));
});
