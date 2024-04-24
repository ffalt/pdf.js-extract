import { PDFExtract } from "../lib/index.mjs";

async function run() {
  const pdfExtract = new PDFExtract();
  const data = await pdfExtract.extract("./example.pdf", {} /* options*/);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(data, null, "\t"));
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
});
