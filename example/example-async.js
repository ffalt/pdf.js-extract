const PDFExtract = require('../lib').PDFExtract;

async function run() {
	const pdfExtract = new PDFExtract();
	const data = await pdfExtract.extract('./exampled.pdf', {} /* options*/);
	console.log(JSON.stringify(data, null, '\t'));
}

run().catch(e => {
	 console.error(e);
});
