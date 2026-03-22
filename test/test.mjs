import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { PDFExtract } from "../lib/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfDirectory = path.resolve(__dirname, "../example/");

const simpleTestCases = [
	"example.pdf",
	"cmap.pdf",
	"attachment.pdf",
	"py-pdf-examples/002-trivial-libre-office-writer.pdf",
	"py-pdf-examples/annotated_pdf.pdf",
	"py-pdf-examples/base64image.pdf",
	"py-pdf-examples/cmyk-image.pdf",
	"py-pdf-examples/crazyones-pdfa.pdf",
	"py-pdf-examples/habibi-oneline-cmap.pdf",
	"py-pdf-examples/habibi-rotated.pdf",
	"py-pdf-examples/habibi.pdf",
	"py-pdf-examples/libre-office-link.pdf",
	"py-pdf-examples/libreoffice-form.pdf",
	"py-pdf-examples/minimal-document.pdf",
	"py-pdf-examples/mistitled_outlines_example.pdf",
	"py-pdf-examples/multicolumn.pdf",
	"py-pdf-examples/output_with_metadata_pymupdf.pdf",
	"py-pdf-examples/pdfkit.pdf",
	"py-pdf-examples/pdflatex-4-pages.pdf",
	"py-pdf-examples/pdflatex-forms.pdf",
	"py-pdf-examples/pdflatex-image.pdf",
	"py-pdf-examples/pdflatex-outline.pdf",
	"py-pdf-examples/reportlab-overlay.pdf",
	"py-pdf-examples/with-attachment.pdf",
	"py-pdf-examples/google-doc-document.pdf",
	"py-pdf-examples/imagemagick-ASCII85Decode.pdf",
	"py-pdf-examples/imagemagick-CCITTFaxDecode.pdf",
	"py-pdf-examples/imagemagick-images.pdf",
	"py-pdf-examples/imagemagick-lzw.pdf",
	"py-pdf-examples/grayscale-image.pdf"
];

const passwordTestCases = [
	{ file: "encrypted.pdf", password: "password" },
	{ file: "py-pdf-examples/libreoffice-writer-password.pdf", password: "openpassword" }
];

const testCases = [
	...simpleTestCases.map(file => ({ file })),
	...passwordTestCases
];

const loadedTestCases = testCases.map(tc => {
	const baseName = path.parse(tc.file).name;
	const dir = path.dirname(tc.file);
	const fileDir = dir === "." ? "" : dir + "/";
	const outputFile = `${fileDir}${baseName}.json`;
	const textFile = `${fileDir}${baseName}.txt`;
	let output = {};
	if (fs.existsSync(path.join(pdfDirectory, outputFile))) {
		output = JSON.parse(fs.readFileSync(path.join(pdfDirectory, outputFile)).toString());
	}
	let expectedText = [];
	if (fs.existsSync(path.join(pdfDirectory, textFile))) {
		expectedText = fs.readFileSync(path.join(pdfDirectory, textFile)).toString().trim().split('\n');
	}
	return {
		...tc,
		outputFile,
		textFile,
		filePath: path.join(pdfDirectory, tc.file),
		output,
		expectedText
	};
});

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

function cloneWithIgnore(obj, ignoreKeys = []) {
	return obj.map(item => {
		return {
			...item, content: item.content.map(entry => {
				const cloned = { ...entry };
				ignoreKeys.forEach(key => {
					cloned[key] = undefined;
				});
				return cloned;
			})
		};
	});
}

function deepEqualPages(a, b, ignoreKeys = []) {
	const cloneA = cloneWithIgnore(a, ignoreKeys);
	const cloneB = cloneWithIgnore(b, ignoreKeys);
	expect(cloneA).toEqual(cloneB);
}

describe("PDFExtract", () => {
	describe.each(loadedTestCases)("#extractBuffer() for $file", (testCase) => {
		const options = {
			includeImages: true,
			includeAttachments: true
		};
		if (testCase.password) {
			options.password = testCase.password;
		}

		it("should extract pdf buffer without error", (done) => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(testCase.filePath);
			extract.extractBuffer(buffer, options, (err) => {
				if (err) done(err);
				else done();
			});
		});

		it("should extract pdf buffer with right data", (done) => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(testCase.filePath);
			extract.extractBuffer(buffer, options, (err, data) => {
				if (err) return done(err);
				try {
					// console.log(JSON.stringify(data));
					expect(data.meta).toEqual(testCase.output.meta);
					deepEqualPages(data.pages, testCase.output.pages, ["fontName"]);
					done();
				} catch (error) {
					done(error);
				}
			});
		});

		it("should async extract pdf buffer with right data", async () => {
			const extract = new PDFExtract();
			const buffer = await readFileAsync(testCase.filePath);
			const data = await extract.extractBuffer(buffer, options);
			expect(data.meta).toEqual(testCase.output.meta);
			deepEqualPages(data.pages, testCase.output.pages, ["fontName"]);
		});

	});

	it("should fail with wrong password on encrypted pdf buffer with error", (done) => {
		const extract = new PDFExtract();
		const buffer = fs.readFileSync(path.join(pdfDirectory, "encrypted.pdf"));
		extract.extractBuffer(buffer, { password: "wrong" }, (err) => {
			try {
				expect(err.name).toBe("PasswordException");
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	describe.each(loadedTestCases)("#extract() for $file", (testCase) => {
		const options = {
			includeImages: true,
			includeAttachments: true
		};
		if (testCase.password) {
			options.password = testCase.password;
		}

		it("should load and extract pdf without error", (done) => {
			const extract = new PDFExtract();
			extract.extract(testCase.filePath, options, (err) => {
				if (err) done(err);
				else done();
			});
		});

		it("should async load and extract pdf with the right data", async () => {
			const extract = new PDFExtract();
			const data = await extract.extract(testCase.filePath, options);
			expect(data.meta).toEqual(testCase.output.meta);
			deepEqualPages(data.pages, testCase.output.pages, ["fontName"]);
		});

	});

	it("should load and fail with wrong password on encrypted pdf with error", (done) => {
		const extract = new PDFExtract();
		extract.extract(path.join(pdfDirectory, "encrypted.pdf"), { password: "wrong" }, (err) => {
			try {
				expect(err.name).toBe("PasswordException");
				done();
			} catch (error) {
				done(error);
			}
		});

	});
});

describe("PDFExtract.tools", () => {
	describe.each(loadedTestCases)("pageToLines for $file", (testCase) => {
		const options = {
			includeImages: false,
			includeAttachments: false
		};
		if (testCase.password) {
			options.password = testCase.password;
		}

		it("should return the correct example lines", (done) => {
			const extract = new PDFExtract();
			extract.extract(testCase.filePath, options, (err, data) => {
				if (err) return done(err);
				const rows = PDFExtract.utils.extractAllPagesTextRows(data.pages, 2).flat();
				// console.log(rows.map(row => row.join("")).join("\n"));
				try {
					const expectedLength = testCase.expectedText.length === 1 && testCase.expectedText.at(0) === '' ? 0 : testCase.expectedText.length;
					expect(rows.length).toBe(expectedLength);
					const text = rows.map((row) => row.join(""));
					expect(text.join("\n")).toBe(testCase.expectedText.join("\n"));
					done();
				} catch (error) {
					done(error);
				}
			});
		}, 30000);
	});

	describe.each(loadedTestCases)("extractAllPagesTextRows for $file", (testCase) => {
		const options = {
			includeImages: false,
			includeAttachments: false
		};
		if (testCase.password) {
			options.password = testCase.password;
		}

		it("should collect rows from all pages", (done) => {
			const extract = new PDFExtract();
			extract.extract(testCase.filePath, options, (err, data) => {
				if (err) return done(err);
				try {
					const allPageRows = PDFExtract.utils.extractAllPagesTextRows(data.pages, 2);
					expect(Array.isArray(allPageRows)).toBe(true);
					expect(allPageRows.length).toBe(data.pages.length);
					allPageRows.forEach((pageRows) => {
						expect(Array.isArray(pageRows)).toBe(true);
					});
					done();
				} catch (error) {
					done(error);
				}
			});
		}, 30000);
	});
});
