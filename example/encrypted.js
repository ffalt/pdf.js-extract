var fs = require('fs');
var PDFExtract = require('../lib').PDFExtract;
var pdfExtract = new PDFExtract();
pdfExtract.extract('./encrypted.pdf', { password: 'password'}, function (err, data) {
	if (err) return console.log(err);
	fs.writeFileSync('./encrypted-output.json', JSON.stringify(data, null, '\t'));
	console.log(JSON.stringify(data, null, '\t'));
});