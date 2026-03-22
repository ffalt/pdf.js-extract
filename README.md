# pdf.js-extract

Extracts text/annotations/attachments/images from PDF files

> [!NOTE]
> This library is for **Node.js**. It is not meant to be used in the browser.

Read a PDF file and exports all pages & texts with coordinates. 
This can be e.g. used to extract structured table data.
Options include extracting attachments and images as well.

This package includes a build of [pdf.js](https://github.com/mozilla/pdf.js).

> [!IMPORTANT]
> NO OCR!

## Install

[![NPM](https://nodei.co/npm/pdf.js-extract.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/pdf.js-extract)

![test](https://github.com/ffalt/pdf.js-extract/workflows/test/badge.svg)
[![license](https://img.shields.io/npm/l/pdf.js-extract.svg)](http://opensource.org/licenses/MIT) 

## Options
```typescript
export interface PDFExtractOptions {
  firstPage?: number; // default:`1` - start extract at page nr
  lastPage?: number; //  stop extract at page nr, no default value
  password?: string; //  for decrypting password-protected PDFs., no default value
  verbosity?: number; // default:`-1` - log level of pdf.js
  normalizeWhitespace?: boolean; // default:`false` - replaces all occurrences of whitespace with standard spaces (0x20).
  disableCombineTextItems?: boolean; // default:`false` - do not attempt to combine  same line {@link TextItem}'s.
  includeAttachments?: boolean; // include attachments as base64. The default value is `false`.
  includeImages?: boolean; // include images as base64. The default value is `false`.
}
```

## Example Usage

### Async Javascript with Callback using Buffer

```javascript
import { PDFExtract } from 'pdf.js-extract';
import fs from 'node:fs';
const pdfExtract = new PDFExtract();
const buffer = fs.readFileSync("./example.pdf");
const options = {}; 
pdfExtract.extractBuffer(buffer, options, (err, data) => {
  if (err) return console.log(err);
  console.log(data);
});
```

### Async Javascript with Callback

```javascript
import { PDFExtract } from 'pdf.js-extract';
const pdfExtract = new PDFExtract();
const options = {}; 
pdfExtract.extract('test.pdf', options, (err, data) => {
  if (err) return console.log(err);
  console.log(data);
});
```

### Async Typescript with Promise

```typescript
import {PDFExtract, PDFExtractOptions} from 'pdf.js-extract';
const pdfExtract = new PDFExtract();
const options: PDFExtractOptions = {}; 
pdfExtract.extract('test.pdf', options)
  .then(data => console.log(data))
  .catch(err=> console.log(err));
```

### Extract Specific Pages

```javascript
import { PDFExtract } from 'pdf.js-extract';
const pdfExtract = new PDFExtract();

// Extract only pages 2 through 5
const data = await pdfExtract.extract('report.pdf', { firstPage: 2, lastPage: 5 });
console.log(`Extracted ${data.pages.length} pages`);
```

### Password-Protected PDFs

```javascript
import { PDFExtract } from 'pdf.js-extract';
const pdfExtract = new PDFExtract();

const data = await pdfExtract.extract('secure.pdf', { password: 'my-secret' });
console.log(data.pages[0].content.map(item => item.str).join(' '));
```

### Collect All Text from a PDF

```javascript
import { PDFExtract } from 'pdf.js-extract';
const pdfExtract = new PDFExtract();
const data = await pdfExtract.extract('document.pdf', { normalizeWhitespace: true });

const fullText = data.pages
  .map(page => page.content.map(item => item.str).join(' '))
  .join('\n\n');

console.log(fullText);
```

### Extract Text as Lines and Rows (Table Data)

The built-in utility functions help convert raw text items into structured lines and table rows.

```javascript
import { PDFExtract } from 'pdf.js-extract';
const pdfExtract = new PDFExtract();
const data = await pdfExtract.extract('table.pdf');

const page = data.pages[0];

// Group text items into lines (items within 5 units of y are merged)
const lines = PDFExtract.utils.pageToLines(page, 5);

// Get plain text rows
const rows = PDFExtract.utils.extractTextRows(lines);
console.log(rows); // [['Name', 'Age', 'City'], ['Alice', '30', 'Berlin'], ...]

// Or map to columns by x-positions with a tolerance of 10 units
const columns = [50, 200, 350]; // x-positions of each column
const tableRows = PDFExtract.utils.extractColumnRows(lines, columns, 10);
console.log(tableRows);
```

### Extract All Pages as Text Rows

```javascript
import { PDFExtract } from 'pdf.js-extract';
const pdfExtract = new PDFExtract();
const data = await pdfExtract.extract('multi-page.pdf');

// Get text rows for every page at once (merge items within 5 y-units)
const allRows = PDFExtract.utils.extractAllPagesTextRows(data.pages, 5);
allRows.forEach((pageRows, i) => {
  console.log(`--- Page ${i + 1} ---`);
  pageRows.forEach(row => console.log(row.join(' | ')));
});
```

### Extract Links

```javascript
import { PDFExtract } from 'pdf.js-extract';
const pdfExtract = new PDFExtract();
const data = await pdfExtract.extract('document.pdf');

data.pages.forEach((page) => {
  if (!page.annotations) return;

  const links = page.annotations.filter(a => a.subtype === 'Link' && a.url);
  links.forEach(link => {
    console.log(`Page ${page.info.num}: ${link.overlaidText || 'link'} -> ${link.url}`);
  });
});
```

### Extract Attachments

```javascript
import { PDFExtract } from 'pdf.js-extract';
import fs from 'node:fs';
const pdfExtract = new PDFExtract();
const data = await pdfExtract.extract('document.pdf', { includeAttachments: true });

if (data.attachments) {
  data.attachments.forEach(att => {
    if (att.base64data) {
      const buffer = Buffer.from(att.base64data, 'base64');
      fs.writeFileSync(att.filename || 'attachment.bin', buffer);
      console.log(`Saved ${att.filename} (${buffer.length} bytes)`);
    }
  });
}
```

### Extract Images

```javascript
const pdfExtract = new PDFExtract();
const data = await pdfExtract.extract('document.pdf', { includeImages: true });

// Access images for each page
data.pages.forEach((page) => {
  if (page.images && page.images.length > 0) {
    console.log(`Page ${page.info.num} has ${page.images.length} images`);
    
    page.images.forEach((img) => {
      console.log(`  Image ${img.index}: ${img.width}x${img.height}px (${img.colorSpace})`);
      
      // Save image if data available
      if (img.base64data) {
        const buffer = Buffer.from(img.base64data, 'base64');
        fs.writeFileSync(`image_${img.index}.jpg`, buffer);
      }
    });
  }
});
```

#### Image Properties

Each extracted image contains:

```typescript
interface PDFExtractImage {
  index: number;              // Image index on the page
  width: number;              // Image width in pixels
  height: number;             // Image height in pixels
  kind: number;               // Image type: 1=XObject, 2=Inline, 3=Form
  base64data?: string;        // Base64-encoded image data
  colorSpace?: string;        // Color space (DeviceRGB, DeviceGray, DeviceCMYK, etc.)
  bitsPerComponent?: number;  // Bits per component (typically 8)
  filter?: string;            // Compression filter (DCTDecode, FlateDecode, etc.)
}
```

#### Image Types

- **kind 1 - XObject**: Standard image objects from page resources (most common)
- **kind 2 - Inline**: Images embedded directly in content streams
- **kind 3 - Form**: Images contained within Form XObjects

## Example Output

```json
{
  "filename": "helloworld.pdf",
  "meta": {
    "info": {
      "PDFFormatVersion": "1.7",
      "IsAcroFormPresent": false,
      "IsCollectionPresent": false,
      "IsLinearized": true,
      "IsXFAPresent": false
    },
    "metadata": {
      "dc:format": "application/pdf",
      "dc:creator": "someone",
      "dc:title": "This is a hello world PDF file",
      "xmp:createdate": "2000-06-29T10:21:08+11:00",
      "xmp:creatortool": "Microsoft Word 8.0",
      "xmp:modifydate": "2013-10-28T15:24:13-04:00",
      "xmp:metadatadate": "2013-10-28T15:24:13-04:00",
      "pdf:producer": "Acrobat Distiller 4.0 for Windows",
      "xmpmm:documentid": "uuid:0205e221-80a8-459e-a522-635ed5c1e2e6",
      "xmpmm:instanceid": "uuid:68d6ae6d-43c4-472d-9b28-7c4add8f9e46"
    }
  },
  "pages": [
    {
      "pageInfo": {
        "num": 1,
        "scale": 1,
        "rotation": 0,
        "offsetX": 0,
        "offsetY": 0,
        "width": 200,
        "height": 200,
        "view": { "minX": 0, "minY": 0, "maxX": 200, "maxY": 200 }
      },
      "annotations": [
        {
          "annotationType": 2,
          "annotationFlags": 0,
          "borderStyle": {
            "width": 0,
            "rawWidth": 1,
            "style": 1,
            "dashArray": [3],
            "horizontalCornerRadius": 0,
            "verticalCornerRadius": 0
          },
          "color": [0, 0, 0],
          "borderColor": [0, 0, 0],
          "rotation": 0,
          "contentsObj": {
            "str": "",
            "dir": "ltr"
          },
          "hasAppearance": false,
          "id": "4R",
          "rect": [92.043, 771.389, 217.757, 785.189],
          "subtype": "Link",
          "hasOwnCanvas": false,
          "noRotate": false,
          "noHTML": false,
          "isEditable": false,
          "structParent": -1,
          "url": "https://example.com/",
          "unsafeUrl": "https://example.com/",
          "overlaidText": "a link to an awesome site",
          "x": 217.757,
          "y": 785.189
        }
      ],
      "content": [
        {
          "x": 70,
          "y": 150,
          "str": "Hello, world!",
          "dir": "ltr",
          "width": 64.656,
          "height": 12,
          "fontName": "Times"
        }
      ],
      "images": [
        {
          "index": 0,
          "width": 16,
          "height": 16,
          "kind": 1,
          "base64data": "AAAAAAAAEAgAAAEAAQABAAEAAAAQEBAwD+AAAAAAAAA="
        }
      ]
    }
  ],
  "attachments": [
    {
      "filename": "My first attachment",
      "base64data": "VGhpcyBpcyB0aGUgY29udGVudHMgb2YgYSBub24gb3Mgc3BlY2lmaWMgZW1iZWRkZWQgZmlsZQ=="
    }
  ],
  "pdfInfo": {
    "numPages": 1,
    "fingerprint": "1ee9219eb9eaa49acbfc20155ac359c3"
  }
}
```

Note: The `images` and `attachments` arrays are optional and only included when they are detected in the PDF. 
