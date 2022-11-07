<a name="0.2.1"></a>
## 0.2.1 (2022/11/07)
### Features
* docs: add extractBuffer in README by @GiulianoReginatto in https://github.com/ffalt/pdf.js-extract/pull/35
* don't clobber global.document if it already exists by @chadkirby in https://github.com/ffalt/pdf.js-extract/pull/38

<a name="0.2.0"></a>
## 0.2.0 (2022/03/29)
### Features
*  pdf.js version 2.14.110
*  imports: Safeguard stubbing in case of shared library [#27](https://github.com/ffalt/pdf.js-extract/issues/27)

### BREAKING
* metadata obj keys are included directly (no longer in a child object _metadata)
* node 12 is minimum version

<a name="0.1.5"></a>
## 0.1.5 (2020/12/10)
### Features
*  option object optional
*  pdf.js version 2.7.355

<a name="0.1.4"></a>
## 0.1.4 (2019/12/30)
### Fixes
*  sort result pages to make ensure ascending order

<a name="0.1.3"></a>
## 0.1.3 (2019/10/14)
### Features
*   extract links from page.getAnnotations()

<a name="0.1.2"></a>
## 0.1.2 (2019/09/04)
### Features
*   Additional Promise Api
    *   extract(filename, options): Promise&lt;PDFExtractResult&gt;
    *   extractBuffer(buffer, options): Promise&lt;PDFExtractResult&gt;

*   pdf.js version 2.3.146

<a name="0.1.1"></a>
## 0.1.1 (2018/11/13)
### Features
*   pdf.js version 2.1.54
