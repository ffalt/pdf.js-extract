var fs = require('fs');
var assert = require('assert');
var PDFExtract = require('../lib').PDFExtract;
var pdfExtract = new PDFExtract();
var buffer = fs.readFileSync('./example.pdf');
pdfExtract.extractBuffer(buffer, {}, function(err, data) {
  if (err) {
    return console.log(err);
  }
  var expected = require('./example-output.json');
  assert.deepEqual(data.meta, expected.meta);
  assert.deepEqual(data.pages, expected.pages);
});
