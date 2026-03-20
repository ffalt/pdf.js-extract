import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { PDFExtract } from "../lib/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfDirectory = path.resolve(__dirname, "../example/");

const testCases = [
	{
		name: "example",
		file: "example.pdf",
		outputFile: "example.json",
		textFile: "example.txt",
		password: undefined
	},
	{
		name: "encrypted",
		file: "encrypted.pdf",
		outputFile: "encrypted.json",
		textFile: "encrypted.txt",
		password: "password"
	},
	{
		name: "cmap",
		file: "cmap.pdf",
		outputFile: "cmap.json",
		textFile: "cmap.txt",
		password: undefined
	},
	{
		name: "attachment",
		file: "attachment.pdf",
		outputFile: "attachment.json",
		textFile: "attachment.txt",
		password: undefined
	}
];

const loadedTestCases = testCases.map(tc => ({
	...tc,
	filePath: path.join(pdfDirectory, tc.file),
	output: JSON.parse(fs.readFileSync(path.join(pdfDirectory, tc.outputFile)).toString()),
	expectedText: fs.readFileSync(path.join(pdfDirectory, tc.textFile)).toString().trim().split('\n')
}));

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
	describe("#extractBuffer()", () => {

		it.each(loadedTestCases)("should extract $name pdf buffer without error", (testCase, done) => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(testCase.filePath);
			const options = testCase.password ? { password: testCase.password } : {};
			extract.extractBuffer(buffer, options, (err) => {
				if (err) done(err);
				else done();
			});
		});

		it.each(loadedTestCases)("should extract $name pdf buffer with right data", (testCase, done) => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(testCase.filePath);
			const options = testCase.password ? { password: testCase.password } : {};
			extract.extractBuffer(buffer, options, (err, data) => {
				if (err) return done(err);
				try {
					expect(data.meta).toEqual(testCase.output.meta);
					deepEqualPages(data.pages, testCase.output.pages, ["fontName"]);
					done();
				} catch (error) {
					done(error);
				}
			});
		});

		it.each(loadedTestCases)("should async extract $name pdf buffer with right data", async (testCase) => {
			const extract = new PDFExtract();
			const buffer = await readFileAsync(testCase.filePath);
			const options = testCase.password ? { password: testCase.password } : {};
			const data = await extract.extractBuffer(buffer, options);
			expect(data.meta).toEqual(testCase.output.meta);
			deepEqualPages(data.pages, testCase.output.pages, ["fontName"]);
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

	});

	describe("#extract()", () => {

		it.each(loadedTestCases)("should load and extract $name pdf without error", (testCase, done) => {
			const extract = new PDFExtract();
			const options = testCase.password ? { password: testCase.password } : {};
			extract.extract(testCase.filePath, options, (err) => {
				if (err) done(err);
				else done();
			});
		});

		it.each(loadedTestCases)("should async load and extract $name pdf with the right data", async (testCase) => {
			const extract = new PDFExtract();
			const options = testCase.password ? { password: testCase.password } : {};
			const data = await extract.extract(testCase.filePath, options);
			expect(data.meta).toEqual(testCase.output.meta);
			deepEqualPages(data.pages, testCase.output.pages, ["fontName"]);
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
});

describe("PDFExtract.tools", () => {
	describe("pageToLines", () => {
		it.each(loadedTestCases)("should return the correct $name example lines", (testCase, done) => {
			const extract = new PDFExtract();
			const options = testCase.password ? { password: testCase.password } : {};
			extract.extract(testCase.filePath, options, (err, data) => {
				if (err) return done(err);
				const page = data.pages[0];
				const lines = PDFExtract.utils.pageToLines(page, 2);
				const rows = PDFExtract.utils.extractTextRows(lines);
				try {
					expect(rows.length).toBe(testCase.expectedText.length);
					const text = rows.map((row) => row.join(""));
					expect(text.join("\n")).toBe(testCase.expectedText.join("\n"));
					done();
				} catch (error) {
					done(error);
				}
			});
		});
	});
});
