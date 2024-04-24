import { writeFileSync } from "fs";
import { PDFExtract } from "../lib/index.mjs";

const pdfExtract = new PDFExtract();

pdfExtract.extract("./example-cmap.pdf", {}, function (err, data) {
  if (err) {
    // eslint-disable-next-line no-console
    return console.error(err);
  }
  writeFileSync("./example-cmap-output.json", JSON.stringify(data, null, "\t"));

  const lines = PDFExtract.utils.pageToLines(data.pages[0], 2);
  const rows = PDFExtract.utils.extractTextRows(lines);
  const text = rows.map((row) => row.join("")).join("\n");
  writeFileSync("./example-cmap-output.txt", text);
});
