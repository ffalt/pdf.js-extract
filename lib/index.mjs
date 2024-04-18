import { readFile } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import utils from "./utils.mjs";
import LocalCMapReaderFactory from "./cmap-reader.mjs";

import { getDocument } from "./pdfjs/pdf.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PDFExtract {
  constructor() {}

  extract(filename, options, cb) {
    if (!cb) {
      return new Promise((resolve, reject) => {
        this.extract(filename, options, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }
    readFile(filename, (err, buffer) => {
      if (err) {
        return cb(err);
      }
      return this.extractBuffer(buffer, options, (err, pdf) => {
        if (err) {
          cb(err);
        } else {
          pdf.filename = filename;
          cb(null, pdf);
        }
      });
    });
  }

  extractBuffer(buffer, options = {}, cb) {
    if (!cb) {
      return new Promise((resolve, reject) => {
        this.extractBuffer(buffer, options, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }
    // Loading file from file system into typed array
    if (options.verbosity === undefined) {
      // get rid of all warnings in nodejs usage
      options.verbosity = -1;
    }
    if (options.cMapUrl === undefined) {
      options.cMapUrl = join(__dirname, "./cmaps/"); // trailing path delimiter is important
    }
    if (options.cMapPacked === undefined) {
      options.cMapPacked = true;
    }
    if (options.CMapReaderFactory === undefined) {
      options.CMapReaderFactory = LocalCMapReaderFactory;
    }
    options.data = new Uint8Array(buffer);
    const pdf = {
      meta: {},
      pages: [],
    };
    // Will be using promises to load document, pages and misc data instead of callback.
    getDocument(options)
      .promise.then((doc) => {
        const firstPage = options && options.firstPage ? options.firstPage : 1;
        const lastPage = Math.min(
          options && options.lastPage ? options.lastPage : doc.numPages,
          doc.numPages,
        );
        pdf.pdfInfo = doc.pdfInfo;
        const promises = [
          doc.getMetadata().then((data) => {
            pdf.meta = {
              info: data.info,
              metadata: data.metadata ? data.metadata.getAll() || null : null,
            };
          }),
        ];
        const loadPage = (pageNum) =>
          doc.getPage(pageNum).then((page) => {
            const viewport = page.getViewport({ scale: 1.0 });
            const pag = {
              pageInfo: {
                num: pageNum,
                scale: viewport.scale,
                rotation: viewport.rotation,
                offsetX: viewport.offsetX,
                offsetY: viewport.offsetY,
                width: viewport.width,
                height: viewport.height,
              },
            };
            pdf.pages.push(pag);
            const normalizeWhitespace = !!(
              options && options.normalizeWhitespace === true
            );
            const disableCombineTextItems = !!(
              options && options.disableCombineTextItems === true
            );
            return Promise.all([
              page.getAnnotations().then((annotations) => {
                pag.links = annotations
                  .filter((annot) => annot.subtype === "Link" && !!annot.url)
                  .map((link) => link.url);
              }),
              page
                .getTextContent({
                  normalizeWhitespace,
                  disableCombineTextItems,
                })
                .then((content) => {
                  // Content contains lots of information about the text layout and styles, but we need only strings at the moment
                  pag.content = content.items.map((item) => {
                    const tm = item.transform;
                    let x = tm[4];
                    let y = pag.pageInfo.height - tm[5];
                    if (viewport.rotation === 90) {
                      x = tm[5];
                      y = tm[4];
                    }
                    // see https://github.com/mozilla/pdf.js/issues/8276
                    const height = Math.sqrt(tm[2] * tm[2] + tm[3] * tm[3]);
                    return {
                      x: x,
                      y: y,
                      str: item.str,
                      dir: item.dir,
                      width: item.width,
                      height: height,
                      fontName: item.fontName,
                    };
                  });
                }),
            ]).then(
              () => {
                // console.log("done page content parsing");
              },
              (err) => {
                cb(err);
              },
            );
          });
        for (let i = firstPage; i <= lastPage; i++) {
          promises.push(loadPage(i));
        }
        return Promise.all(promises);
      })
      .then(
        () => {
          pdf.pages.sort((a, b) => a.pageInfo.num - b.pageInfo.num);
          cb(null, pdf);
        },
        (err) => {
          cb(err);
        },
      );
  }
}

PDFExtract.utils = utils;

export { PDFExtract };
