var path = require('path');
var fs = require('fs');
var assert = require('assert');
var PDFExtract = require('../lib').PDFExtract;
var pdfLib = require('../lib/pdfjs/pdf.js');
const chai = require('chai');
const chaiExclude = require('chai-exclude');
chai.use(chaiExclude);

var pdf_directory = path.resolve(__dirname, '../example/');
var sample_file = path.join(pdf_directory, 'example.pdf');
var sample_output = JSON.parse(fs.readFileSync(path.join(pdf_directory, 'example-output.json')).toString());
var sample_encrypted_file = path.join(pdf_directory, 'encrypted.pdf');
var sample_encrypted_output = JSON.parse(fs.readFileSync(path.join(pdf_directory, 'encrypted-output.json')).toString());

describe('PDFExtract', function () {

	describe('#extractBuffer()', function () {
		it('should extract pdf buffer without error', function (done) {
			var extract = new PDFExtract();
			var buffer = fs.readFileSync(sample_file);
			extract.extractBuffer(buffer, {}, function (err) {
				if (err) done(err);
				else done();
			});
		});
		it('should extract pdf buffer with right data', function (done) {
			var extract = new PDFExtract();
			var buffer = fs.readFileSync(sample_file);
			extract.extractBuffer(buffer, {}, function (err, data) {
				if (err) return done(err);
				try {
					// fontNames may be generated ids
					chai.expect(data.meta).excludingEvery('fontName').to.deep.equal(sample_output.meta);
					chai.expect(data.pages).excludingEvery('fontName').to.deep.equal(sample_output.pages);
					done();
				} catch (error) {
					done(error);
				}
			});
		});
		it('should extract encrypted pdf buffer without error', function (done) {
			var extract = new PDFExtract();
			var buffer = fs.readFileSync(sample_encrypted_file);
			extract.extractBuffer(buffer, {password: 'password'}, function (err) {
				if (err) done(err);
				else done();
			});
		});
		it('should extract encrypted pdf buffer with right data', function (done) {
			var extract = new PDFExtract();
			var buffer = fs.readFileSync(sample_encrypted_file);
			extract.extractBuffer(buffer, {password: 'password'}, function (err, data) {
				if (err) return done(err);
				try {
					// fontNames may be generated ids
					chai.expect(data.meta).excludingEvery('fontName').to.deep.equal(sample_encrypted_output.meta);
					chai.expect(data.pages).excludingEvery('fontName').to.deep.equal(sample_encrypted_output.pages);
					done();
				} catch (error) {
					done(error);
				}
			});
		});
		it('should fail with wrong password on encrypted pdf buffer with error', function (done) {
			var extract = new PDFExtract();
			var buffer = fs.readFileSync(sample_encrypted_file);
			extract.extractBuffer(buffer, {password: 'wrong'}, function (err) {
				try {
					chai.expect(err).to.be.an.instanceof(pdfLib.PDFJS.PasswordException);
					done();
				} catch (error) {
					done(error);
				}
			});
		});
	});

	describe('#extract()', function () {
		it('should load and extract pdf without error', function (done) {
			var extract = new PDFExtract();
			extract.extract(sample_file, {}, function (err) {
				if (err) done(err);
				else done();
			});
		});
		it('should load and extract encrypted pdf without error', function (done) {
			var extract = new PDFExtract();
			extract.extract(sample_encrypted_file, {password: 'password'}, function (err) {
				if (err) done(err);
				else done();
			});
		});
		it('should load and fail with wrong password on encrypted pdf with error', function (done) {
			var extract = new PDFExtract();
			extract.extract(sample_encrypted_file, {password: 'wrong'}, function (err) {
				try {
					chai.expect(err).to.be.an.instanceof(pdfLib.PDFJS.PasswordException);
					done();
				} catch (error) {
					done(error);
				}
			});
		});
	});

});

describe('PDFExtract.tools', function () {
	describe('pageToLines', function () {
		it('should return the correct example lines', function (done) {
			var extract = new PDFExtract();
			extract.extract(sample_file, {}, function (err, data) {
				if (err) return done(err);
				var page = data.pages[0];
				var lines = PDFExtract.utils.pageToLines(page, 2);
				var rows = PDFExtract.utils.extractTextRows(lines);
				try {
					chai.expect(rows.length).to.be.equal(17);
					var text = rows.map(function (row) {
						return row.join('');
					});
					var content = [
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

				// .join('\n');
				// console.log('page',rows.length);
				// console.log('pages',text);
			});
		});
		it('should return the correct encrypted example lines', function (done) {
			var extract = new PDFExtract();
			extract.extract(sample_encrypted_file, {password: 'password'}, function (err, data) {
				if (err) return done(err);
				var page = data.pages[0];
				var lines = PDFExtract.utils.pageToLines(page, 2);
				var rows = PDFExtract.utils.extractTextRows(lines);
				try {
					chai.expect(rows.length).to.be.equal(1);
					var text = rows.map(function (row) {
						return row.join('');
					}).join('\n');
					chai.expect(text).to.equal('Hello I’m an encrypted pdf ');
					done();
				} catch (error) {
					done(error);
				}

				// .join('\n');
				// console.log('page',rows.length);
				// console.log('pages',text);
			});
		});
	});
});
