import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../test/fixtures/color-examples");

function writePdf(filename, buildFn) {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({ size: "A4", margin: 50 });
		const dest = path.join(outDir, filename);
		const stream = fs.createWriteStream(dest);
		stream.on("finish", () => {
			console.log(`  created ${dest}`);
			resolve();
		});
		stream.on("error", reject);
		doc.pipe(stream);
		buildFn(doc);
		doc.end();
	});
}

fs.mkdirSync(outDir, { recursive: true });
console.log("Generating color test PDFs...");

await writePdf("single-color.pdf", doc => {
	doc.fillColor("#000000").fontSize(12).text("Hello World");
});

await writePdf("two-paragraph-colors.pdf", doc => {
	doc.fillColor("#ff0000").fontSize(12).text("Red paragraph");
	doc.fillColor("#0000ff").fontSize(12).text("Blue paragraph");
});

await writePdf("inline-color-changes.pdf", doc => {
	doc.fontSize(12);
	doc.fillColor("#ff0000").text("Red ", { continued: true });
	doc.fillColor("#00ff00").text("Green ", { continued: true });
	doc.fillColor("#0000ff").text("Blue");
});

await writePdf("many-words-same-color.pdf", doc => {
	doc.fillColor("#333333").fontSize(12);
	doc.text("word1 word2 word3 word4 word5 word6 word7 word8 word9 word10");
});

await writePdf("save-restore.pdf", doc => {
	doc.fontSize(12);
	doc.fillColor("#ff0000").text("Red before save");
	doc.save();
	doc.fillColor("#0000ff").text("Blue inside save");
	doc.restore();
	doc.text("Should be red again after restore");
});

await writePdf("gray-color.pdf", doc => {
	doc.fillColor("#808080").fontSize(12).text("Gray text");
});

await writePdf("cmyk-color.pdf", doc => {
	doc.fillColor("cyan").fontSize(12).text("Cyan text");
});

await writePdf("alternating-colors.pdf", doc => {
	const colors = ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#00ffff"];
	doc.fontSize(12);
	for (let i = 0; i < colors.length; i++) {
		doc.fillColor(colors[i]).text(`Line ${i} with color ${colors[i]}`);
	}
});

await writePdf("multi-page-colors.pdf", doc => {
	doc.fillColor("#ff0000").fontSize(12).text("Page 1 red text");
	doc.addPage();
	doc.fillColor("#0000ff").fontSize(12).text("Page 2 blue text");
});

await writePdf("drift-resistance.pdf", doc => {
	doc.fontSize(12);
	doc.fillColor("#ff0000");
	doc.text("Word1 ", { continued: true });
	doc.text("Word2 ", { continued: true });
	doc.text("Word3 ", { continued: true });
	doc.text("Word4 ", { continued: true });
	doc.text("Word5");
	doc.fillColor("#0000ff").text("This must be blue");
});

await writePdf("three-color-sections.pdf", doc => {
	doc.fontSize(12);
	doc.fillColor("#ff0000").text("Section A - Red");
	doc.moveDown();
	doc.fillColor("#00ff00").text("Section B - Green");
	doc.moveDown();
	doc.fillColor("#0000ff").text("Section C - Blue");
});

console.log("Done.");

