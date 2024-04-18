import { readFileSync } from "fs";
import { deepEqual } from "assert";
import { PDFExtract } from "../lib/index.mjs";

const pdfExtract = new PDFExtract();

const json = JSON.parse(readFileSync("./example-output.json", "utf8"));
const buffer = readFileSync("./example.pdf");

pdfExtract.extractBuffer(buffer, {}, (err, data) => {
  if (err) {
    return console.error(err);
  }

  deepEqual(data.meta, json.meta);
  deepEqual(data.pages, json.pages);
});
