import {
  PDFExtract,
  PDFExtractResult,
  PDFExtractOptions,
} from "pdf.js-extract";

async function run(): Promise<void> {
  const pdfExtract = new PDFExtract();
  const options: PDFExtractOptions = { normalizeWhitespace: true };
  const data: PDFExtractResult = await pdfExtract.extract(
    "./example.pdf",
    options,
  );
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(data, null, "\t"));
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  return console.error(e);
});
