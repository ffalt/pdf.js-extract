const path = require('path');
const fs = require('fs');
const PDFExtract = require('../lib').PDFExtract;
const chai = require('chai');
const chaiExclude = require('chai-exclude');
chai.use(chaiExclude);

const pdf_directory = path.resolve(__dirname, '../example/');
const sample_file = path.join(pdf_directory, 'example.pdf');
const sample_output = JSON.parse(fs.readFileSync(path.join(pdf_directory, 'example-output.json')).toString());
const sample_encrypted_file = path.join(pdf_directory, 'encrypted.pdf');
const sample_encrypted_output = JSON.parse(fs.readFileSync(path.join(pdf_directory, 'encrypted-output.json')).toString());

describe('PDFExtract', () => {

	describe('#extractBuffer()', () => {
		it('should extract pdf buffer without error', done => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(sample_file);
			extract.extractBuffer(buffer, {}, err => {
				if (err) done(err);
				else done();
			});
		});
		it('should extract pdf buffer with right data', done => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(sample_file);
			extract.extractBuffer(buffer, {}, (err, data) => {
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
		it('should extract encrypted pdf buffer without error', done => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(sample_encrypted_file);
			extract.extractBuffer(buffer, {password: 'password'}, err => {
				if (err) done(err);
				else done();
			});
		});
		it('should extract encrypted pdf buffer with right data', done => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(sample_encrypted_file);
			extract.extractBuffer(buffer, {password: 'password'}, (err, data) => {
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
		it('should fail with wrong password on encrypted pdf buffer with error', done => {
			const extract = new PDFExtract();
			const buffer = fs.readFileSync(sample_encrypted_file);
			extract.extractBuffer(buffer, {password: 'wrong'}, err => {
				try {
					chai.expect(err.name).to.be.equal('PasswordException');
					done();
				} catch (error) {
					done(error);
				}
			});
		});
	});

	describe('#extract()', () => {
		it('should load and extract pdf without error', done => {
			const extract = new PDFExtract();
			extract.extract(sample_file, {}, err => {
				if (err) done(err);
				else done();
			});
		});
		it('should load and extract encrypted pdf without error', done => {
			const extract = new PDFExtract();
			extract.extract(sample_encrypted_file, {password: 'password'}, err => {
				if (err) done(err);
				else done();
			});
		});
		it('should load and fail with wrong password on encrypted pdf with error', done => {
			const extract = new PDFExtract();
			extract.extract(sample_encrypted_file, {password: 'wrong'}, err => {
				try {
					chai.expect(err.name).to.be.equal('PasswordException');
					done();
				} catch (error) {
					done(error);
				}
			});
		});
	});

});

describe('PDFExtract.tools', () => {
	describe('pageToLines', () => {
		it('should return the correct example lines', done => {
			const extract = new PDFExtract();
			extract.extract(sample_file, {}, (err, data) => {
				if (err) return done(err);
				const page = data.pages[0];
				const lines = PDFExtract.utils.pageToLines(page, 2);
				const rows = PDFExtract.utils.extractTextRows(lines);
				try {
					chai.expect(rows.length).to.be.equal(17);
					const text = rows.map(row => row.join(''));
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

				// .join('\n');
				// console.log('page',rows.length);
				// console.log('pages',text);
			});
		});
		it('should return the correct encrypted example lines', done => {
			const extract = new PDFExtract();
			extract.extract(sample_encrypted_file, {password: 'password'}, (err, data) => {
				if (err) return done(err);
				const page = data.pages[0];
				const lines = PDFExtract.utils.pageToLines(page, 2);
				const rows = PDFExtract.utils.extractTextRows(lines);
				try {
					chai.expect(rows.length).to.be.equal(1);
					const text = rows.map(row => row.join('')).join('\n');
					chai.expect(text).to.equal('Hello I’m an encrypted pdf ');
					done();
				} catch (error) {
					done(error);
				}
			});
		});
	});
});
