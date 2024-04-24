import { writeFileSync } from "fs";
import { PDFExtract } from "../lib/index.mjs";

async function run() {
  const pdfExtract = new PDFExtract();
  const options = { normalizeWhitespace: true };
  const data = await pdfExtract.extract("./example.pdf", options);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(data, null, "\t"));

  writeFileSync("./example-output.json", JSON.stringify(data, null, "\t"));

  const lines = PDFExtract.utils.pageToLines(data.pages[0], 2);
  const rows = PDFExtract.utils.extractTextRows(lines);
  const text = rows.map((row) => row.join("")).join("\n");
  writeFileSync("./example-output.txt", text);
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  return console.error(e);
});
