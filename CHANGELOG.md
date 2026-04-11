# Changelog

## 1.0.0 (2026/04/11)

### Features
* pdf.js version 5.5.207
* option to extract attachments (`includeAttachments`)
* option to extract images (`includeImages`)
* option to include font colors in text items (`includeColors`)
* full extraction of annotations (including links)
* package modernized to ESM; CJS entry point still available via `require()`

### BREAKING
* various changes to the result format (most are additive, but some are breaking), see MIGRATION.md for details
* node 20 is minimum version

## 0.2.1 (2022/11/07)

### Features
* docs: add extractBuffer in README by @GiulianoReginatto in https://github.com/ffalt/pdf.js-extract/pull/35
* don't clobber global.document if it already exists by @chadkirby in https://github.com/ffalt/pdf.js-extract/pull/38

## 0.2.0 (2022/03/29)

### Features
*  pdf.js version 2.14.110
*  imports: Safeguard stubbing in case of shared library [#27](https://github.com/ffalt/pdf.js-extract/issues/27)

### BREAKING
* metadata obj keys are included directly (no longer in a child object _metadata)
* node 12 is minimum version

## 0.1.5 (2020/12/10)

### Features
*  option object optional
*  pdf.js version 2.7.355

## 0.1.4 (2019/12/30)

### Fixes
*  sort result pages to make ensure ascending order

## 0.1.3 (2019/10/14)

### Features
*   extract links from page.getAnnotations()

## 0.1.2 (2019/09/04)

### Features
*   Additional Promise Api
    *   extract(filename, options): Promise&lt;PDFExtractResult&gt;
    *   extractBuffer(buffer, options): Promise&lt;PDFExtractResult&gt;

*   pdf.js version 2.3.146

## 0.1.1 (2018/11/13)

### Features
*   pdf.js version 2.1.54
