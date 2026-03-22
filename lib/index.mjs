import { readFile } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import * as utils from "./utils.mjs";

import { getDocument, GlobalWorkerOptions } from "./pdfjs/pdf.mjs";
import { getPageImages } from "./extraction/images.mjs";
import { getAttachments } from "./extraction/attachments.mjs";
import { getPageAnnotations } from "./extraction/annotations.mjs";
import { getPageContent } from "./extraction/content.mjs";
import { getMetadata } from "./extraction/metadata.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

GlobalWorkerOptions.workerSrc = new URL("./pdfjs/pdf.worker.mjs", import.meta.url).href;

class PDFExtract {
	constructor() {
	}

	extract(filename, options, cb) {
		if (!cb) {
			return new Promise((resolve, reject) => {
				this.extract(filename, options, (err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			});
		}
		readFile(filename, (err, buffer) => {
			if (err) {
				return cb(err);
			}
			return this.extractBuffer(buffer, options, (err, pdf) => {
				if (err) {
					cb(err);
				} else {
					cb(null, pdf);
				}
			});
		});
	}

	extractBuffer(buffer, options = {}, cb) {
		if (!cb) {
			return this.extractBufferAsync(buffer, options);
		}
		this.extractBufferAsync(buffer, options)
		.then(
				(pdf) => {
					cb(null, pdf);
				},
				(err) => cb(err)
		);
	}

	async extractBufferAsync(buffer, options) {
		options.data = new Uint8Array(buffer);
		// Loading file from file system into typed array
		if (options.verbosity === undefined) {
			// get rid of all warnings in nodejs usage
			options.verbosity = -1;
		}
		if (options.cMapUrl === undefined) {
			options.cMapUrl = join(__dirname, "./cmaps/"); // trailing path delimiter is important
		}
		if (options.cMapPacked === undefined) {
			options.cMapPacked = true;
		}
		const textExtractOptions = {
			normalizeWhitespace: options.normalizeWhitespace === true,
			disableCombineTextItems: options.disableCombineTextItems === true
		};
		const doc = await getDocument(options).promise;
		const pdf = {
			meta: {},
			pages: [],
			info: doc._pdfInfo ? {
				numPages: doc._pdfInfo.numPages,
				fingerprints: doc._pdfInfo.fingerprints.filter(fp => fp !== null)
			} : undefined
		};
		const firstPage = options && options.firstPage ? options.firstPage : 1;
		const lastPage = Math.min(
				options && options.lastPage ? options.lastPage : doc.numPages,
				doc.numPages
		);

		const getPageInfo = (pageNum, page) => {
			const viewport = page.getViewport({ scale: 1.0 });
			return {
				num: pageNum,
				scale: viewport.scale,
				rotation: viewport.rotation,
				offsetX: viewport.offsetX,
				offsetY: viewport.offsetY,
				width: viewport.width,
				height: viewport.height,
				view: { minX: page.view[0], minY: page.view[1], maxX: page.view[2], maxY: page.view[3] },
			};
		};

		const getPage = async (pageNum) => {
			const page = await doc.getPage(pageNum);
			await page.getOperatorList();
			const resultPage = {
				info: getPageInfo(pageNum, page),
				content: await getPageContent(page, textExtractOptions),
			};
			const annotations = await getPageAnnotations(page);
			if (annotations) {
				resultPage.annotations = annotations;
			}
		if (options.includeImages) {
			const images = await getPageImages(page);
			if (images) {
				resultPage.images = images;
			}
		}
			pdf.pages.push(resultPage);
		};

		pdf.meta = await getMetadata(doc);
		if (options.includeAttachments) {
			pdf.attachments = await getAttachments(doc);
		}
		for (let i = firstPage; i <= lastPage; i++) {
			await getPage(i);
		}
		return pdf;
	}
}

PDFExtract.utils = utils;

export { PDFExtract };
