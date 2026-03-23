import { PDFExtract } from "../lib/index.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfDirectory = path.resolve(__dirname, "../test/fixtures/");

const passwords = {
	"encrypted.pdf": "password",
	"py-pdf-examples/libreoffice-writer-password.pdf": "openpassword",
	"pdfbox-examples/PasswordSample-128bit.pdf": "owner",
	"pdfbox-examples/PasswordSample-256bit.pdf": "user",
	"pdfbox-examples/PasswordSample-40bit.pdf": "user",
	"pdfbox-examples/sign_me_protected.pdf": " "
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
	const options = { includeImages: true, includeAttachments: true, includeColors: true };
	const password = passwords[file.replaceAll(path.sep, "/")];
	if (password) {
		options.password = password;
	}
	const filePath = path.join(pdfDirectory, file);
	console.log("processing:", filePath);
	const data = await extract.extract(filePath, options);

	const JSONFile = path.join(pdfDirectory, file.replace(/\.pdf$/i, ".json"));
	fs.writeFileSync(JSONFile, JSON.stringify(data, null, "\t"));
	const TXTFile = path.join(pdfDirectory, file.replace(/\.pdf$/i, ".txt"));
	const rows = PDFExtract.utils.extractAllPagesTextRows(data.pages, 2).flat();
	fs.writeFileSync(TXTFile, rows.map(row => row.join("")).join("\n"));
}
console.log("Done.");
