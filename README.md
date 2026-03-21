# pdf.js-extract

Extracts text/annotations/attachments/images from PDF files

> [!NOTE]
> This library is for **Node.js**. If you want to use pdf.js in the browser, please check out the [pdf.js project](https://github.com/mozilla/pdf.js).

Read a PDF file and exports all pages & texts with coordinates. 
This can be e.g. used to extract structured table data.
Options include extracting attachments and images as well.

This package includes a build of [pdf.js](https://github.com/mozilla/pdf.js).

> [!IMPORTANT]
> NO OCR!

## Install

[![NPM](https://nodei.co/npm/pdf.js-extract.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/pdf.js-extract/)

![test](https://github.com/ffalt/pdf.js-extract/workflows/test/badge.svg)
[![license](https://img.shields.io/npm/l/pdf.js-extract.svg)](http://opensource.org/licenses/MIT) 

## Example Usage

javascript async with callback
```javascript
import { PDFExtract } from 'pdf.js-extract';
const pdfExtract = new PDFExtract();
const options = {}; /* see below */
pdfExtract.extract('test.pdf', options, (err, data) => {
  if (err) return console.log(err);
  console.log(data);
});
```

javascript async with callback using buffer
```javascript
import { PDFExtract } from 'pdf.js-extract';
import fs from 'node:fs';
const pdfExtract = new PDFExtract();
const buffer = fs.readFileSync("./example.pdf");
const options = {}; /* see below */
pdfExtract.extractBuffer(buffer, options, (err, data) => {
  if (err) return console.log(err);
  console.log(data);
});
```

typescript async with promise
```typescript
import {PDFExtract, PDFExtractOptions} from 'pdf.js-extract';
const pdfExtract = new PDFExtract();
const options: PDFExtractOptions = {}; /* see below */
pdfExtract.extract('test.pdf', options)
  .then(data => console.log(data))
  .catch(err=> console.log(err));
```

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

## Image Extraction

The library can extracts images from PDF documents using multiple methods.

### Basic Image Extraction

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

### Image Properties

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

### Image Types

- **kind 1 - XObject**: Standard image objects from page resources (most common)
- **kind 2 - Inline**: Images embedded directly in content streams
- **kind 3 - Form**: Images contained within Form XObjects

### Full Documentation

Example Output

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
        "height": 200
      },
      "links": [
        "https://github.com"
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
          "width": 100,
          "height": 100,
          "kind": 1,
          "colorSpace": "DeviceRGB",
          "bitsPerComponent": 8,
          "filter": "DCTDecode",
          "base64data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        }
      ]
    }
  ],
  "pdfInfo": {
    "numPages": 1,
    "fingerprint": "1ee9219eb9eaa49acbfc20155ac359c3"
  }
}
```

_Note: The `images` array is optional and only included when images are detected in the PDF. The `base64data` field shown is truncated for example purposes.
