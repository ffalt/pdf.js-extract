import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { PDFExtract } from "../lib/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pdfDirectory = path.resolve(__dirname, "./fixtures/");

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
			files.push(path.relative(base, full).replaceAll('\\', '/'));
		}
	}
	return files.sort();
}

const testCases = findPdfs(pdfDirectory);

const loadedTestCases = testCases.map(file => {
	const baseName = path.parse(file).name;
	const dir = path.dirname(file);
	const fileDir = dir === "." ? "" : `${dir}/`;
	const outputFile = `${fileDir}${baseName}.json`;
	const textFile = `${fileDir}${baseName}.txt`;
	let output = {};
	if (fs.existsSync(path.join(pdfDirectory, outputFile))) {
		output = JSON.parse(fs.readFileSync(path.join(pdfDirectory, outputFile)).toString());
	}
	let expectedText = ["not generated"];
	if (fs.existsSync(path.join(pdfDirectory, textFile))) {
		expectedText = fs.readFileSync(path.join(pdfDirectory, textFile)).toString().trim().split(/\r?\n/);
	}
	return {
		file,
		password: passwords[file],
		outputFile,
		textFile,
		filePath: path.join(pdfDirectory, file),
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
	return obj.map(item => ({
			...item, content: item.content.map(entry => {
				const cloned = { ...entry };
				ignoreKeys.forEach(key => {
					cloned[key] = undefined;
				});
				return cloned;
			})
		}));
}

function deepEqualPages(a, b, ignoreKeys = []) {
	const cloneA = cloneWithIgnore(a, ignoreKeys);
	const cloneB = cloneWithIgnore(b, ignoreKeys);
	expect(cloneA).toEqual(cloneB);
}

describe("PDFExtract", () => {
	describe.each(loadedTestCases)("#extractBuffer() for $file", testCase => {
		const options = {
			includeImages: true,
			includeAttachments: true,
			includeColors: true
		};
		if (testCase.password) {
			options.password = testCase.password;
		}

		it("should extract pdf buffer without error", done => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(testCase.filePath);
			extract.extractBuffer(buffer, options, err => {
				if (err) done(err);
				else done();
			});
		});

		it("should extract pdf buffer with right data", done => {
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

	it("should fail with wrong password on encrypted pdf buffer with error", done => {
		const extract = new PDFExtract();
		const buffer = fs.readFileSync(path.join(pdfDirectory, "encrypted.pdf"));
		extract.extractBuffer(buffer, { password: "wrong" }, err => {
			try {
				expect(err.name).toBe("PasswordException");
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	describe.each(loadedTestCases)("#extract() for $file", testCase => {
		const options = {
			includeImages: true,
			includeAttachments: true,
			includeColors: true
		};
		if (testCase.password) {
			options.password = testCase.password;
		}

		it("should load and extract pdf without error", done => {
			const extract = new PDFExtract();
			extract.extract(testCase.filePath, options, err => {
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

	it("should load and fail with wrong password on encrypted pdf with error", done => {
		const extract = new PDFExtract();
		extract.extract(path.join(pdfDirectory, "encrypted.pdf"), { password: "wrong" }, err => {
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
	describe.each(loadedTestCases)("pageToLines for $file", testCase => {
		const options = {
			includeImages: false,
			includeAttachments: false,
			includeColors: false
		};
		if (testCase.password) {
			options.password = testCase.password;
		}

		it("should return the correct example lines", done => {
			const extract = new PDFExtract();
			extract.extract(testCase.filePath, options, (err, data) => {
				if (err) return done(err);
				const rows = PDFExtract.utils.extractAllPagesTextRows(data.pages, 2).flat();
				// console.log(rows.map(row => row.join("")).join("\n"));
				try {
					const expectedLength = testCase.expectedText.length === 1 && testCase.expectedText.at(0) === '' ? 0 : testCase.expectedText.length;
					expect(rows.length).toBe(expectedLength);
					const text = rows.map(row => row.join(""));
					expect(text.join("\n")).toBe(testCase.expectedText.join("\n"));
					done();
				} catch (error) {
					done(error);
				}
			});
		}, 30000);
	});

	describe.each(loadedTestCases)("extractAllPagesTextRows for $file", testCase => {
		const options = {
			includeImages: false,
			includeAttachments: false,
			includeColors: false
		};
		if (testCase.password) {
			options.password = testCase.password;
		}

		it("should collect rows from all pages", done => {
			const extract = new PDFExtract();
			extract.extract(testCase.filePath, options, (err, data) => {
				if (err) return done(err);
				try {
					const allPageRows = PDFExtract.utils.extractAllPagesTextRows(data.pages, 2);
					expect(Array.isArray(allPageRows)).toBe(true);
					expect(allPageRows.length).toBe(data.pages.length);
					allPageRows.forEach(pageRows => {
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
