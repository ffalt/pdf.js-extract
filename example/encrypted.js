const fs = require('fs');
const PDFExtract = require('../lib').PDFExtract;

const pdfExtract = new PDFExtract();
pdfExtract.extract('./encrypted.pdf', {password: 'password'}, function (err, data) {
	if (err) {
		return console.error(err);
	}

	fs.writeFileSync('./encrypted-output.json', JSON.stringify(data, null, '\t'));
	console.log(JSON.stringify(data, null, '\t'));

	const lines = PDFExtract.utils.pageToLines(data.pages[0], 2);
	const rows = PDFExtract.utils.extractTextRows(lines);
	const text = rows.map(function (row) {
		return row.join('');
	}).join('\n');
	fs.writeFileSync('./encrypted-output.txt', text);

});
