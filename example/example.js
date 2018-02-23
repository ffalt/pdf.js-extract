var fs = require('fs');
var PDFExtract = require('../lib').PDFExtract;
var pdfExtract = new PDFExtract();
pdfExtract.extract('./example.pdf', {} /* options*/, function (err, data) {
	if (err) return console.log(err);
	fs.writeFileSync('./example-output.json', JSON.stringify(data, null, '\t'));
	var lines = PDFExtract.utils.pageToLines(data.pages[0], 2);
	var rows = PDFExtract.utils.extractTextRows(lines);
	var text = rows.map(function (row) {
		return row.join('');
	}).join('\n');
	fs.writeFileSync('./example-output.txt', text);
	console.log(JSON.stringify(data, null, '\t'));
});
