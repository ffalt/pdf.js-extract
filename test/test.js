const path = require("path");
const fs = require("fs");
const PDFExtract = require("../lib").PDFExtract;
const chai = require("chai");
const chaiExclude = require("chai-exclude");
chai.use(chaiExclude);

const pdfDirectory = path.resolve(__dirname, "../example/");
const sampleFile = path.join(pdfDirectory, "example.pdf");
const sampleOutput = JSON.parse(fs.readFileSync(path.join(pdfDirectory, "example-output.json")).toString());
const sampleEncryptedFile = path.join(pdfDirectory, "encrypted.pdf");
const sampleCmapFile = path.join(pdfDirectory, "example-cmap.pdf");
const sampleEncryptedOutput = JSON.parse(fs.readFileSync(path.join(pdfDirectory, "encrypted-output.json")).toString());

function readFileAsync(filename) {
	return new Promise((resolve, reject) => {
		fs.readFile(filename, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

describe("PDFExtract", () => {

	describe("#extractBuffer()", () => {
		it("should extract pdf buffer without error", (done) => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(sampleFile);
			extract.extractBuffer(buffer, {}, (err) => {
				if (err) done(err);
				else done();
			});
		});
		it("should extract pdf buffer with right data", (done) => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(sampleFile);
			extract.extractBuffer(buffer, {}, (err, data) => {
				if (err) return done(err);
				try {
					// fontNames may be generated ids
					chai.expect(data.meta).excludingEvery("fontName").to.deep.equal(sampleOutput.meta);
					chai.expect(data.pages).excludingEvery("fontName").to.deep.equal(sampleOutput.pages);
					done();
				} catch (error) {
					done(error);
				}
			});
		});
		it("should async extract pdf buffer with right data", async () => {
			const extract = new PDFExtract();
			const buffer = await readFileAsync(sampleFile);
			const data = await extract.extractBuffer(buffer, {});
			chai.expect(data.meta).excludingEvery("fontName").to.deep.equal(sampleOutput.meta);
			chai.expect(data.pages).excludingEvery("fontName").to.deep.equal(sampleOutput.pages);
		});
		it("should extract encrypted pdf buffer without error", (done) => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(sampleEncryptedFile);
			extract.extractBuffer(buffer, {password: "password"}, (err) => {
				if (err) done(err);
				else done();
			});
		});
		it("should extract encrypted pdf buffer with right data", (done) => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(sampleEncryptedFile);
			extract.extractBuffer(buffer, {password: "password"}, (err, data) => {
				if (err) return done(err);
				try {
					// fontNames may be generated ids
					chai.expect(data.meta).excludingEvery("fontName").to.deep.equal(sampleEncryptedOutput.meta);
					chai.expect(data.pages).excludingEvery("fontName").to.deep.equal(sampleEncryptedOutput.pages);
					done();
				} catch (error) {
					done(error);
				}
			});
		});
		it("should fail with wrong password on encrypted pdf buffer with error", (done) => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(sampleEncryptedFile);
			extract.extractBuffer(buffer, {password: "wrong"}, (err) => {
				try {
					chai.expect(err.name).to.be.equal("PasswordException");
					done();
				} catch (error) {
					done(error);
				}
			});
		});
	});

	describe("#extract()", () => {
		it("should load and extract pdf without error", (done) => {
			const extract = new PDFExtract();
			extract.extract(sampleFile, {}, (err) => {
				if (err) done(err);
				else done();
			});
		});
		it("should async load and extract pdf with the right data", async () => {
			const extract = new PDFExtract();
			const data = await extract.extract(sampleFile, {});
			chai.expect(data.meta).excludingEvery("fontName").to.deep.equal(sampleOutput.meta);
			chai.expect(data.pages).excludingEvery("fontName").to.deep.equal(sampleOutput.pages);
		});
		it("should load and extract encrypted pdf without error", (done) => {
			const extract = new PDFExtract();
			extract.extract(sampleEncryptedFile, {password: "password"}, (err) => {
				if (err) done(err);
				else done();
			});
		});
		it("should load and fail with wrong password on encrypted pdf with error", (done) => {
			const extract = new PDFExtract();
			extract.extract(sampleEncryptedFile, {password: "wrong"}, (err) => {
				try {
					chai.expect(err.name).to.be.equal("PasswordException");
					done();
				} catch (error) {
					done(error);
				}
			});
		});
		it("should load and extract cmap-pdf without error", (done) => {
			const extract = new PDFExtract();
			extract.extract(sampleCmapFile, {}, (err) => {
				if (err) done(err);
				else done();
			});
		});
	});

});

describe("PDFExtract.tools", () => {
	describe("pageToLines", () => {
		it("should return the correct example lines", (done) => {
			const extract = new PDFExtract();
			extract.extract(sampleFile, {}, (err, data) => {
				if (err) return done(err);
				const page = data.pages[0];
				const lines = PDFExtract.utils.pageToLines(page, 2);
				const rows = PDFExtract.utils.extractTextRows(lines);
				try {
					chai.expect(rows.length).to.be.equal(17);
					const text = rows.map((row) => row.join(""));
					const content = [
						"Adobe Acrobat PDF Files",
						"Adobe® Portable Document Format (PDF) is a universal file format that preserves all",
						"of  the  fonts,  formatting,  colours  and  graphics  of  any  source  document,  regardless  of",
						"the application and platform used to create it.",
						"Adobe PDF is an ideal format for electronic document distribution as it overcomes the",
						"problems commonly encountered with electronic file sharing.",
						"• Anyone, anywhere can open a PDF file. All you need is the free Adobe Acrobat",
						"Reader.  Recipients  of  other  file  formats  sometimes  can't  open  files  because  they",
						"don't have the applications used to create the documents.",
						"• PDF files always print correctly on any printing device.",
						"• PDF  files  always  display  exactly  as  created,  regardless  of  fonts,  software,  and",
						"operating systems. Fonts, and graphics are not lost due to platform, software, and",
						"version incompatibilities.",
						"• The  free  Acrobat  Reader  is  easy  to  download  and  can  be  freely  distributed  by",
						"anyone.",
						"• Compact   PDF   files   are   smaller   than   their   source   files   and   download   a",
						"page at a time for fast display on the Web."
					];
					chai.expect(text).to.deep.equal(content);
					done();
				} catch (error) {
					done(error);
				}

				// .join("\n");
				// console.log("page",rows.length);
				// console.log("pages",text);
			});
		});
		it("should return the correct encrypted example lines", (done) => {
			const extract = new PDFExtract();
			extract.extract(sampleEncryptedFile, {password: "password"}, (err, data) => {
				if (err) return done(err);
				const page = data.pages[0];
				const lines = PDFExtract.utils.pageToLines(page, 2);
				const rows = PDFExtract.utils.extractTextRows(lines);
				try {
					chai.expect(rows.length).to.be.equal(1);
					const text = rows.map((row) => row.join("")).join("\n");
					chai.expect(text).to.equal("Hello I’m an encrypted pdf ");
					done();
				} catch (error) {
					done(error);
				}
			});
		});
		it("should return the correct cmap example lines", (done) => {
			const extract = new PDFExtract();
			extract.extract(sampleCmapFile, {}, (err, data) => {
				if (err) return done(err);
				const page = data.pages[0];
				const lines = PDFExtract.utils.pageToLines(page, 2);
				const rows = PDFExtract.utils.extractTextRows(lines);
				try {
					chai.expect(rows.length).to.be.equal(1);
					const text = rows.map((row) => row.join("")).join("\n");
					chai.expect(text).to.equal("我们都是黑体字");
					done();
				} catch (error) {
					done(error);
				}
			});
		});
	});
});
