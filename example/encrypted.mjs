import { writeFileSync } from "fs";
import { PDFExtract } from "../lib/index.mjs";

const pdfExtract = new PDFExtract();
pdfExtract.extract(
  "./encrypted.pdf",
  { password: "password" },
  function (err, data) {
    if (err) {
      // eslint-disable-next-line no-console
      return console.error(err);
    }

    writeFileSync("./encrypted-output.json", JSON.stringify(data, null, "\t"));
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(data, null, "\t"));

    const lines = PDFExtract.utils.pageToLines(data.pages[0], 2);
    const rows = PDFExtract.utils.extractTextRows(lines);
    const text = rows
      .map(function (row) {
        return row.join("");
      })
      .join("\n");
    writeFileSync("./encrypted-output.txt", text);
  },
);
