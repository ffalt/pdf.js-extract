import { PDFExtract } from "../lib/index.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfDirectory = path.resolve(__dirname, "../example/");

const passwords = {
	"encrypted.pdf": "password",
	"py-pdf-examples/libreoffice-writer-password.pdf": "openpassword",
};

function findPdfs(dir, base = dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...findPdfs(full, base));
		} else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
			files.push(path.relative(base, full));
		}
	}
	return files.sort();
}

const extract = new PDFExtract();
const pdfFiles = findPdfs(pdfDirectory);

for (const file of pdfFiles) {
	const options = { includeImages: true, includeAttachments: true };
	const password = passwords[file.replaceAll(path.sep, "/")];
	if (password) {
		options.password = password;
	}
	const filePath = path.join(pdfDirectory, file);
	const data = await extract.extract(filePath, options);
	delete data.filename;
	const outputFile = path.join(pdfDirectory, file.replace(/\.pdf$/i, ".json"));
	fs.writeFileSync(outputFile, JSON.stringify(data, null, "\t"));
	console.log("updated:", outputFile);
}
console.log("Done.");
