import {readFile} from "fs";
import {fileURLToPath} from "url";
import {join, dirname} from "path";
import * as utils from "./utils.mjs";
import LocalCMapReaderFactory from "./cmap-reader.mjs";

import {getDocument, Util} from "./pdfjs/pdf.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PDFExtract {
  constructor() {
  }

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
      return this.extractBufferAsync(buffer, options);
    }
    this.extractBufferAsync(buffer, options)
      .then(
        (pdf) => {
          cb(null, pdf);
        },
        (err) => cb(err)
      );
  }

  async extractBufferAsync(buffer, options) {
    options.data = new Uint8Array(buffer);
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
    const textExtractOptions = {
      normalizeWhitespace: options.normalizeWhitespace === true,
      disableCombineTextItems: options.disableCombineTextItems === true
    };
    const doc = await getDocument(options).promise;
    const pdf = {
      meta: {},
      pages: [],
      attachments: [],
      info: doc._pdfInfo ? {
        numPages: doc._pdfInfo.numPages,
        fingerprints: doc._pdfInfo.fingerprints.filter(fp => fp !== null)
      } : undefined
    };
    const firstPage = options && options.firstPage ? options.firstPage : 1;
    const lastPage = Math.min(
      options && options.lastPage ? options.lastPage : doc.numPages,
      doc.numPages
    );
    const getAttachments = async () => {
      const attachments = await doc.getAttachments();
      if (attachments) {
        for (const attachment of Object.entries(attachments)) {
          pdf.attachments.push({
            filename: attachment[0],
            base64data: attachment[1].content ? Buffer.from(attachment[1].content).toString('base64') : undefined
          });
        }
      }
    };

    const getMetadata = async () => {
      const data = await doc.getMetadata();
      pdf.meta = {
        info: compact(data.info),
        metadata: data.metadata ? compact(data.metadata.getAll()) : undefined,
      };
    };

    const getPageInfo = (pageNum, page) => {
      const viewport = page.getViewport({scale: 1.0});
      return {
        num: pageNum,
        scale: viewport.scale,
        rotation: viewport.rotation,
        offsetX: viewport.offsetX,
        offsetY: viewport.offsetY,
        width: viewport.width,
        height: viewport.height,
      };
    };

    const compact = (obj) => {
      if (obj === null || obj === undefined) {
        return undefined;
      }
      return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null));
    }

    const getPageNr = async (pageNum) => {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({scale: 1.0});
      const resultPage = {
        info: getPageInfo(pageNum, page)
      };
      pdf.pages.push(resultPage);

      const getPageAnnotation = (annot) => {
        const result = compact(annot);
        if (annot.rect) {
          if (viewport.rotation === 90) {
            result.x = annot.rect[3];
            result.y = annot.rect[2];
          } else {
            result.x = annot.rect[2];
            result.y = annot.rect[3];
          }
        }
        if (annot.file) {
          result.file = {
            filename: annot.file.filename,
            base64data: annot.file.content ? Buffer.from(annot.file.content).toString('base64') : undefined
          };
        }
        return result;
      };

      const getPageAnnotations = async () => {
        const annotations = await page.getAnnotations();
        resultPage.annotations = annotations
          .map((annot) => getPageAnnotation(annot));
      };

      const getPageTextItem = (item, content) => {
        const tx = Util.transform(viewport.transform, item.transform);
        const style = content.styles[item.fontName];
        const fontSize = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
        return {
          str: item.str,
          x: tx[4],
          y: tx[5],
          width: item.width,
          height: item.height === 0 ? fontSize : item.height,
          transform: item.transform,
          font: {
            size: fontSize,
            // get font name, see https://github.com/mozilla/pdf.js/pull/10753, https://github.com/mozilla/pdf.js/issues/15651
            name: page.commonObjs.get(item.fontName).name,
            family: style.fontFamily,
            vertical: style.vertical,
            ascent: isNaN(style.ascent) || style.ascent === null ? undefined : style.ascent,
            descent: isNaN(style.descent) || style.descent === null ? undefined : style.descent
          },
          dir: item.dir,
          hasEOL: item.hasEOL
        };
      };

      const getPageContent = async () => {
        const content = await page.getTextContent(textExtractOptions);
        resultPage.content = content.items
          .map((item) => getPageTextItem(item, content));
      }

      await page.getOperatorList();
      await getPageAnnotations();
      await getPageContent();
    };

    await getMetadata();
    await getAttachments();
    for (let i = firstPage; i <= lastPage; i++) {
      await getPageNr(i);
    }
    return pdf;
  }
}

PDFExtract.utils = utils;

export {PDFExtract};
