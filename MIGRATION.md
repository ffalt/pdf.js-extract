# Migration Guide: v0.2.1 → v1.0.0

This document describes the breaking changes and additions when upgrading from `v0.2.1`.

## PDF.js Version

Upgraded from pdf.js **2.14.110** to **5.5.207**. See [breaking changes in the result json](#breaking-changes-in-the-result-json) below.

## Minimum Node.js Version

| v0.2.1 | Current |
|--------|---------|
| >= 12  | >= 20   |

## ESM

The package has been modernized to module system ESM.
If you use `require()`, the CJS entry point is still available. If you use `import`, the ESM entry point is used automatically.

---

## Breaking Changes in the Result JSON

### 1. `filename` → removed

The top-level `filename` property has been removed from the result.

```diff
  {
    "meta": { ... },
    "pages": [ ... ],
-   "filename": "./example.pdf"
  }
```

### 2. `pdfInfo` → `info` (renamed and restructured)

The top-level document info object has been renamed from `pdfInfo` to `info`, 
and the `fingerprint` string has been replaced by a `fingerprints` array.

```diff
  {
    "meta": { ... },
    "pages": [ ... ],
-   "pdfInfo": {
-     "numPages": 1,
-     "fingerprint": "2e22bde07d96d0408524c26eeecd3483"
-   }
+   "info": {
+     "numPages": 1,
+     "fingerprints": [
+       "2e22bde07d96d0408524c26eeecd3483",
+       "f6c92b368a8a13408457a1d395a37eb9"
+     ]
+   }
  }
```

### 3. `pages[].pageInfo` → `pages[].info` (renamed and extended)

The per-page info object has been renamed from `pageInfo` to `info`, and a new `view` sub-object has been added.

```diff
  {
-   "pageInfo": {
+   "info": {
      "num": 1,
      "scale": 1,
      "rotation": 0,
      "offsetX": 0,
      "offsetY": 0,
      "width": 595,
-     "height": 842
+     "height": 842,
+     "view": {
+       "minX": 0,
+       "minY": 0,
+       "maxX": 595,
+       "maxY": 842
+     }
    }
  }
```

### 4. `pages[].links` → removed

The `links` array has been removed from pages. Link annotations are now available via the new `pages[].annotations` array 
(if present in the PDF). See [Annotations](#annotations) below.

```diff
  {
-   "links": ["https://example.com"],
    "content": [ ... ]
  }
```

### 5. `pages[].content[]` - text item changes

#### `fontName` → `font` object

The `fontName` string has been replaced by a `font` object containing detailed font information.

```diff
  {
    "str": "Hello World",
    "x": 100,
    "y": 200,
    "width": 80,
    "height": 12,
    "dir": "ltr",
-   "fontName": "Times"
+   "font": {
+     "name": "TimesNewRomanPSMT",
+     "family": "serif",
+     "size": 12,
+     "vertical": false,
+     "ascent": 0.891,
+     "descent": -0.216
+   }
  }
```

> **Note:** The `font.name` value may differ from the old `fontName` - it now uses the full PostScript font name rather than a shortened alias.

> **Note:** `font.color` is only present when the `includeColors: true` option is set.

#### New properties on text items

| Property    | Type       | Description                                              |
|-------------|------------|----------------------------------------------------------|
| `transform` | `number[]` | The 6-element transformation matrix `[a, b, c, d, e, f]` |
| `hasEOL`    | `boolean`  | Whether this text item ends a line                       |

#### Property order change

The property order within text items has changed (e.g. `str` comes first now). This should not affect programmatic consumers, but may cause diffs if you compare serialized JSON.

### 6. `meta.info` - optional fields

The following fields have been made optional in `meta.info`:

| Field               | Note                                                |
|---------------------|-----------------------------------------------------|
| `Language`          | Still present in some PDFs, now omitted when `null` |
| `EncryptFilterName` | Still present in some PDFs, now omitted when `null` |

These fields were previously always included (set to `null` when absent). Now they are only present when the PDF actually contains them.

---

## Additions

### New Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includeAttachments` | `boolean` | `false`  | Include file attachments as base64           |
| `includeImages`      | `boolean` | `false`  | Include images as base64                     |
| `includeColors`      | `boolean` | `false`  | Include font color in text content items     |

### Attachments

When `includeAttachments: true`, the result contains a top-level `attachments` array:

```json
{
  "attachments": [
    {
      "filename": "document.pdf",
      "description": "An attached file",
      "base64data": "JVBERi0xLj..."
    }
  ]
}
```

### Images

When `includeImages: true`, each page may contain an `images` array:

```json
{
  "pages": [
    {
      "images": [
        {
          "index": 0,
          "x": 0,
          "y": 0,
          "width": 200,
          "height": 100,
          "kind": 3,
          "transform": [200, 0, 0, -100, 0, 100],
          "base64data": "/9j/4AAQ..."
        }
      ]
    }
  ]
}
```

For tiled/repeated images, a `positions` array is also present containing the repeat positions.

### Annotations

Annotations (including links) are now always extracted when present. 
Each page may contain an `annotations` array with detailed annotation objects.

For example, a link annotation:

```json
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
  "color": "#000000",
  "borderColor": "#000000",
  "rotation": 0,
  "contentsObj": { "str": "", "dir": "ltr" },
  "hasAppearance": false,
  "id": "66R",
  "rect": [80.459, 95.314, 504.618, 116.088],
  "subtype": "Link",
  "hasOwnCanvas": false,
  "noRotate": false,
  "noHTML": false,
  "isEditable": false,
  "structParent": 1,
  "url": "https://www.example.com",
  "unsafeUrl": "https://www.example.com",
  "overlaidText": "Click here to see example.com",
  "x": 504.618,
  "y": 116.088
}
```

### `info` (top-level)

A new top-level `info` object is always present:

```json
{
  "info": {
    "numPages": 2,
    "fingerprints": ["abc123...", "def456..."]
  }
}
```

### `pages[].info.view`

Each page's `info` now includes a `view` object with the page's bounding box:

```json
{
  "view": {
    "minX": 0,
    "minY": 0,
    "maxX": 595,
    "maxY": 842
  }
}
```

---

## Summary of Property Mappings

| v0.2.1 Path                   | Current Path                   | Change Type                               |
|-------------------------------|--------------------------------|-------------------------------------------|
| `filename`                    | *(removed)*                    | 🔴 Removed                                |
| `pdfInfo`                     | `info`                         | 🔴 Renamed                                |
| `pdfInfo.fingerprint`         | `info.fingerprints`            | 🔴 Changed (string → array)               |
| `pdfInfo.numPages`            | `info.numPages`                | 🔴 Renamed (parent renamed)               |
| `pages[].pageInfo`            | `pages[].info`                 | 🔴 Renamed                                |
| `pages[].links`               | *(removed, see annotations)*   | 🔴 Removed                                |
| `pages[].content[].fontName`  | `pages[].content[].font.name`  | 🔴 Restructured                           |
| `meta.info.Language`          | `meta.info.Language`           | 🟡 No longer included when `null`         |
| `meta.info.EncryptFilterName` | `meta.info.EncryptFilterName`  | 🟡 No longer included when `null`         |
| -                             | `pages[].info.view`            | 🟢 Added                                  |
| -                             | `pages[].content[].transform`  | 🟢 Added                                  |
| -                             | `pages[].content[].font`       | 🟢 Added                                  |
| -                             | `pages[].content[].font.color` | 🟢 Added (requires `includeColors: true`) |
| -                             | `pages[].content[].hasEOL`     | 🟢 Added                                  |
| -                             | `pages[].annotations`          | 🟢 Added                                  |
| -                             | `pages[].images`               | 🟢 Added                                  |
| -                             | `attachments`                  | 🟢 Added                                  |

