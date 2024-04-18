import { PDFExtract } from "../lib/index.mjs";

async function run() {
  const pdfExtract = new PDFExtract();
  const data = await pdfExtract.extract("./example.pdf", {} /* options*/);
  console.log(JSON.stringify(data, null, "\t"));
}

run().catch((e) => {
  console.error(e);
});
