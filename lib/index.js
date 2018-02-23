var fs = require('fs');

// HACK few hacks to let PDF.js be loaded not as a module in global space.
require('./pdfjs/domstubs.js').setStubs(global);
var pdfjsLib = require('./pdfjs/pdf.js');

function PDFExtract() {
}

PDFExtract.prototype.extract = function (filename, options, cb) {
	/*
	 * This is based on Basic node example that prints document metadata and text content.
	 *
	 * Any copyright is dedicated to the Public Domain.
	 * http://creativecommons.org/publicdomain/zero/1.0/ */
	var _this = this;
	fs.readFile(filename, function (err, buffer) {
		if (err) {
			return cb(err);
		}
		return _this.extractBuffer(buffer, options, function (err, pdf) {
			if (err) {
				return cb(err);
			}
			pdf.filename = filename;
			cb(null, pdf);
		});
	});
};

PDFExtract.prototype.extractBuffer = function (buffer, options, cb) {
	// Loading file from file system into typed array
	if (options.verbosity === undefined) {
		// get rid of all warnings in nodejs usage
		options.verbosity = -1;
	}
	options.data = new Uint8Array(buffer);
	var pdf = {
		meta: {},
		pages: []
	};
	// Will be using promises to load document, pages and misc data instead of callback.
	pdfjsLib.getDocument(options).then(function (doc) {
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
						var tm = item.transform;
						var x = tm[4];
						var y = pag.pageInfo.height - tm[5];
						if (viewport.rotation === 90) {
							x = tm[5];
							y = tm[4];
						}
						// see https://github.com/mozilla/pdf.js/issues/8276
						var height = Math.sqrt(tm[2] * tm[2] + tm[3] * tm[3]);
						return {
							x: x,
							y: y,
							str: item.str,
							dir: item.dir,
							width: item.width,
							height: height,
							fontName: item.fontName
						};
					});
				}).then(function () {
					// console.log('done page parsing');
				}, function(err){
					cb(err);
				});
			});
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
};

PDFExtract.utils = require('./utils.js');

module.exports.PDFExtract = PDFExtract;
