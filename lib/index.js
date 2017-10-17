var fs = require('fs');
var utils = require('./utils.js');
var pdfjsLib = require('./pdfjs/pdf.combined');
// get rid of warnings in nodejs usage
// pdfjsLib.verbosity = pdfjsLib.VERBOSITY_LEVELS.errors;

// HACK few hacks to let PDF.js be loaded not as a module in global space.
require('./pdfjs/domstubs.js').setStubs(global);

function PDFExtract() {
}

PDFExtract.prototype.extract = function (filename, options, cb) {
	/*
	 * This is based on Basic node example that prints document metadata and text content.
	 *
	 * Any copyright is dedicated to the Public Domain.
	 * http://creativecommons.org/publicdomain/zero/1.0/ */

	fs.readFile(filename, function (err, buffer) {
		if (err) return cb(err);
		// Loading file from file system into typed array
		var data = new Uint8Array(buffer);
		var pdf = {
			filename: filename,
			meta: {},
			pages: []
		};
		// Will be using promises to load document, pages and misc data instead of callback.
		pdfjsLib.getDocument({data: data}).then(function (doc) {
			var numPages = doc.numPages;
			pdf.pdfInfo = doc.pdfInfo;
			var lastPromise; // will be used to chain promises
			lastPromise = doc.getMetadata().then(function (data) {
				pdf.meta = data;
			});
			var loadPage = function (pageNum) {
				return doc.getPage(pageNum).then(function (page) {
					var viewport = page.getViewport(1.0 /* scale */);
					var pag = {
						pageInfo: {
							num: pageNum,
							scale: viewport.scale,
							rotation: viewport.rotation,
							offsetX: viewport.offsetX,
							offsetY: viewport.offsetY,
							width: viewport.width,
							height: viewport.height,
							fontScale: viewport.fontScale
						}
					};
					pdf.pages.push(pag);
					return page.getTextContent().then(function (content) {
						// Content contains lots of information about the text layout and styles, but we need only strings at the moment
						pag.content = content.items.map(function (item) {
							var x = item.transform[4];
							var y = pag.pageInfo.height - item.transform[5];
							if (viewport.rotation == 90) {
								x = item.transform[5]
								y = item.transform[4];
							}
							return {
								x: x,
								y: y,
								str: item.str,
								dir: item.dir,
								width: item.width,
								height: item.height,
								fontName: item.fontName
							};
						});
					}).then(function () {
						// console.log('done page parsing');
					});
				})
			};
			// Loading of the first page will wait on metadata and subsequent loadings
			// will wait on the previous pages.
			for (var i = 1; i <= numPages; i++) {
				lastPromise = lastPromise.then(loadPage.bind(null, i));
			}
			return lastPromise;
		}).then(function () {
			cb(null, pdf);
		}, function (err) {
			cb(err);
		});
	});
};

PDFExtract.utils = utils;

exports.PDFExtract = PDFExtract;
