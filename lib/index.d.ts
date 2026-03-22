declare module "pdf.js-extract" {
  export class PDFExtract {
    extract(
      filename: string,
      options: PDFExtractOptions,
      callback: (err: Error | null, pdf?: PDFExtractResult) => void,
    ): void;
    extract(
      filename: string,
      options?: PDFExtractOptions,
    ): Promise<PDFExtractResult>;

    extractBuffer(
      buffer: Buffer,
      options: PDFExtractOptions,
      callback: (err: Error | null, pdf?: PDFExtractResult) => void,
    ): void;
    extractBuffer(
      buffer: Buffer,
      options?: PDFExtractOptions
    ): Promise<PDFExtractResult>;

    extractBufferAsync(
      buffer: Buffer,
      options?: PDFExtractOptions
    ): Promise<PDFExtractResult>;
  }

  export interface PDFExtractOptions {
    firstPage?: number; // start extract at page nr, The default value is `1`
    lastPage?: number; //  stop extract at page nr, no default value
    password?: string; //  for decrypting password-protected PDFs., no default value
    verbosity?: number; // log level of pdf.js, default value is `-1`
    normalizeWhitespace?: boolean; //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
    disableCombineTextItems?: boolean; // do not attempt to combine  same line {@link TextItem}'s. The default value is `false`.
    includeAttachments?: boolean; // include attachments as base64. The default value is `false`.
    includeImages?: boolean; // include images as base64. The default value is `false`.
  }

  export interface PDFExtractResult {
    filename?: string;
    meta: PDFExtractMeta;
    pages: Array<PDFExtractPage>;
    attachments?: Array<PDFExtractAttachment>;
    info?: PDFExtractInfo;
  }

  export type PDFExtractBidiDir = "ltr" | "rtl" | "ttb";

  export interface PDFExtractMetaInfo {
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
    IsCollectionPresent?: boolean;
    IsLinearized?: boolean;
    IsSignaturesPresent?: boolean;
    IsXFAPresent?: boolean;
    Title?: string;
    Subject?: string;
    Author?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
    Language?: string;
    EncryptFilterName?: string;
    Trapped?: PDFExtractName;
    Custom?: Record<string, string | number | boolean | PDFExtractName>;
  }

  export interface PDFExtractMeta {
    info?: PDFExtractMetaInfo;
    metadata?: {
      [name: string]: string | Array<string>;
    };
  }

  export interface PDFExtractAttachment {
    filename?: string;
    base64data?: string;
  }

  export interface PDFExtractInfo {
    numPages: number;
    fingerprints?: Array<string>;
  }

  export interface PDFExtractPageInfo {
    num: number;
    scale: number;
    rotation: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    view: { minX: number; minY: number; maxX: number; maxY: number };
  }

  export interface PDFExtractPage {
    info: PDFExtractPageInfo;
    content: Array<PDFExtractText>;
    annotations?: Array<PDFExtractAnnotation>;
    images?: Array<PDFExtractImage>;
  }

  export interface PDFExtractImage {
    index: number;
    width: number;
    height: number;
    kind: number;
    base64data?: string;
    colorSpace?: string;
    bitsPerComponent?: number;
    filter?: string;
  }

  export interface PDFExtractText {
    str: string;
    x: number;
    y: number;
    width: number;
    height: number;
    transform: number[];
    font: PDFExtractFont;
    dir: PDFExtractBidiDir;
    hasEOL: boolean;
  }

  export interface PDFExtractFont {
    name: string;
    family: string;
    size: number;
    vertical?: boolean;
    ascent?: number;
    descent?: number;
  }

  type PDFExtractAnnotType =
    | "Caret"
    | "Circle"
    | "FileAttachment"
    | "FreeText"
    | "Ink"
    | "Line"
    | "Link"
    | "Highlight"
    | "Polygon"
    | "PolyLine"
    | "Popup"
    | "Stamp"
    | "Square"
    | "Squiggly"
    | "StrikeOut"
    | "Text"
    | "Underline"
    | "Widget";

  export const enum PDFExtractAnnotFlag {
    UNDEFINED = 0,
    INVISIBLE = 0b00_0000_0001,
    HIDDEN = 0b00_0000_0010,
    PRINT = 0b00_0000_0100,
    NOZOOM = 0b00_0000_1000,
    NOROTATE = 0b00_0001_0000,
    NOVIEW = 0b00_0010_0000,
    READONLY = 0b00_0100_0000,
    LOCKED = 0b00_1000_0000,
    TOGGLENOVIEW = 0b01_0000_0000,
    LOCKEDCONTENTS = 0b10_0000_0000,
  }

  export const enum PDFExtractAnnotBorderStyleType {
    SOLID = 1,
    DASHED = 2,
    BEVELED = 3,
    INSET = 4,
    UNDERLINE = 5,
  }

  export interface PDFExtractAnnotBorderStyle {
    width: number;
    rawWidth?: number;
    type?: PDFExtractAnnotBorderStyleType;
    style?: number;
    dashArray: number[];
    horizontalCornerRadius: number;
    verticalCornerRadius: number;
  }

  export interface PDFExtractBidiText {
    str: string;
    dir: PDFExtractBidiDir;
  }

  interface PDFExtractAnnotCommonAttrsData {
    class?: string[];
    dataId?: string;
    href?: string;
    id?: string;
    name?: string;
    newWindow?: boolean;
    style?: Record<string, string | undefined>;
    tabindex?: number;
    textContent?: string;
    type?: string;
    xfaOn?: string;
    xfaOff?: string;
    xmlns?: string;
  }

  export interface PDFExtractAnnotXFASVGAttrs extends PDFExtractAnnotCommonAttrsData {
    xmlns: "http://www.w3.org/2000/svg";

    viewBox?: string;
    preserveAspectRatio?: string;

    cx?: string;
    cy?: string;
    rx?: string;
    ry?: string;
    d?: string;
    vectorEffect?: string;
  }

  export interface PDFExtractAnnotXFASVGObj extends PDFExtractAnnotXFAElObjBase {
    attributes?: PDFExtractAnnotXFASVGAttrs;
  }

  export type PDFExtractAnnotXFAElObj = PDFExtractAnnotXFAHTMLObj | PDFExtractAnnotXFASVGObj;
  export type PDFExtractAnnotXFAElData = PDFExtractAnnotXFAElObj | string | boolean;

  export interface PDFExtractAnnotXFAElObjBase {
    name: string;
    value?: string;
    children?: (PDFExtractAnnotXFAElData | undefined)[];
  }

  export interface PDFExtractAnnotXFAHTMLAttrs extends PDFExtractAnnotCommonAttrsData {
    alt?: string;
    "aria-label"?: string;
    "aria-level"?: string;
    "aria-required"?: boolean;
    checked?: boolean;
    dir?: string;
    fieldId?: string;
    hidden?: boolean;
    mark?: string;
    maxLength?: number;
    multiple?: boolean;
    role?: string;
    required?: boolean;
    selected?: boolean;
    src?: URL | string;
    title?: string;
    value?: string;
    xfaName?: string;
  }

  export interface PDFExtractAnnotXFAHTMLObj extends PDFExtractAnnotXFAElObjBase {
    attributes?: PDFExtractAnnotXFAHTMLAttrs;
  }

  export interface PDFExtractAnnotRichText {
    str: string;
    html: PDFExtractAnnotXFAHTMLObj;
  }

  type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
    ? R
    : _TupleOf<T, N, [...R, T]>;
  export type TupleOf<T, N extends number> = N extends N
    ? number extends N ? T[] : _TupleOf<T, N, []>
    : never;

  export type PDFExtractAnnotRect = TupleOf<number, 4>;

  export type PDFExtractAnnotActionEventName =
    | "WillSave"
    | "Mouse Enter"
    | "Mouse Exit"
    | "Mouse Down"
    | "Mouse Up"
    | "Focus"
    | "Blur"
    | "PageVisible"
    | "PageInvisible"
    | "Keystroke"
    | "Format"
    | "Validate"
    | "Calculate"
    | "WillClose"
    | "DidSave"
    | "WillPrint"
    | "DidPrint"
    | "PageOpen"
    | "PageClose"
    | "OpenAction"
    | "Action";
  export type PDFExtractAnnotActions = Record<PDFExtractAnnotActionEventName, string[]>;

  export const enum PDFExtractAnnotationType {
    TEXT = 1,
    LINK,
    FREETEXT,
    LINE,
    SQUARE,
    CIRCLE,
    POLYGON,
    POLYLINE,
    HIGHLIGHT,
    UNDERLINE,
    SQUIGGLY,
    STRIKEOUT,
    STAMP,
    CARET,
    INK,
    POPUP,
    FILEATTACHMENT,
    SOUND,
    MOVIE,
    WIDGET,
    SCREEN,
    PRINTERMARK,
    TRAPNET,
    WATERMARK,
    THREED,
    REDACT,
  }

  export interface PDFExtractAnnotDefaultAppearanceData {
    fontSize: number;
    fontName: string;
    fontColor?: Uint8ClampedArray;
  }

  export const enum PDFExtractAnnotFieldFlag {
    READONLY = 0x0000001,
    REQUIRED = 0x0000002,
    NOEXPORT = 0x0000004,
    MULTILINE = 0x0001000,
    PASSWORD = 0x0002000,
    NOTOGGLETOOFF = 0x0004000,
    RADIO = 0x0008000,
    PUSHBUTTON = 0x0010000,
    COMBO = 0x0020000,
    EDIT = 0x0040000,
    SORT = 0x0080000,
    FILESELECT = 0x0100000,
    MULTISELECT = 0x0200000,
    DONOTSPELLCHECK = 0x0400000,
    DONOTSCROLL = 0x0800000,
    COMB = 0x1000000,
    RICHTEXT = 0x2000000,
    RADIOSINUNISON = 0x2000000,
    COMMITONSELCHANGE = 0x4000000,
  }

  export const enum PDFExtractAnnotReplyType {
    GROUP = "Group",
    REPLY = "R",
  }

  interface PDFExtractName {
    name: string;
  }

  type PDFExtractAnnotLineEndingStr_ =
    | "None"
    | "Square"
    | "Circle"
    | "Diamond"
    | "OpenArrow"
    | "ClosedArrow"
    | "Butt"
    | "ROpenArrow"
    | "RClosedArrow"
    | "Slash";
  export type PDFExtractAnnotDot = [x: number, y: number];

  export interface PDFExtractAnnotation {
    x?: number;
    y?: number;
    annotationFlags: PDFExtractAnnotFlag;
    color?: Uint8ClampedArray;
    backgroundColor?: Uint8ClampedArray;
    borderStyle: PDFExtractAnnotBorderStyle;
    borderColor?: Uint8ClampedArray;
    rotation: number;
    contentsObj: PDFExtractBidiText;
    richText?: PDFExtractAnnotRichText;
    hasAppearance: boolean;
    id: string;
    modificationDate?: string;
    rect: PDFExtractAnnotRect;
    subtype?: PDFExtractAnnotType;
    hasOwnCanvas: boolean;
    noRotate: boolean;
    noHTML: boolean;
    opacity?: number;
    isEditable?: boolean;
    structParent?: number;

    kidIds?: string[];
    actions?: PDFExtractAnnotActions;
    baseFieldName?: string;
    fieldName?: string;
    pageIndex?: number;

    annotationType?: PDFExtractAnnotationType;

    name?: string;
    state?: string;
    stateModel?: string;

    quadPoints?: TupleOf<PDFExtractAnnotPoint, 4>[];

    /* WidgetAnnotation */
    fieldValue?: string | string[];
    defaultFieldValue?: string | string[];
    alternativeText?: string;
    defaultAppearance?: string;
    defaultAppearanceData?: PDFExtractAnnotDefaultAppearanceData;
    fieldType?: string;
    fieldFlags?: PDFExtractAnnotFieldFlag;
    readOnly?: boolean;
    hidden?: boolean;
    password?: boolean;

    required?: boolean;
    /* ~ */

    /* TextWidgetAnnotation */
    textAlignment?: number;
    maxLen?: number;
    multiLine?: boolean;
    comb?: boolean;
    doNotScroll?: boolean;
    /* ~ */

    /* ButtonWidgetAnnotation */
    checkBox?: boolean;
    radioButton?: boolean;
    pushButton?: boolean;
    isTooltipOnly?: boolean;
    exportValue?: string;
    buttonValue?: string;
    /* ~ */

    /* ChoiceWidgetAnnotation */
    options?: {
      exportValue?: string | string[];
      displayValue?: string | string[];
    }[];
    combo?: boolean;
    multiSelect?: boolean;
    /* ~ */

    /* MarkupAnnotation */
    inReplyTo?: string;
    replyType?: PDFExtractAnnotReplyType;
    titleObj?: PDFExtractBidiText;
    creationDate?: string;
    popupRef?: string;
    /* ~ */

    lineCoordinates?: PDFExtractAnnotRect; /* LineAnnotation */

    vertices?: PDFExtractAnnotPoint[]; /* PolylineAnnotation */

    lineEndings?: [
      PDFExtractAnnotLineEndingStr_,
      PDFExtractAnnotLineEndingStr_,
    ]; /* LineAnnotation, PolylineAnnotation */

    inkLists?: PDFExtractAnnotPoint[][]; /* InkAnnotation */

    overlaidText?: string; /* MarkupAnnotation */

    //

    /* FileAttachmentAnnotation */
    file?: PDFExtractAttachment;
    fillAlpha?: number;
    /* ~ */

    /* PopupAnnotation */
    parentType?: string;
    parentId?: string;
    parentRect?: PDFExtractAnnotRect;
    open?: boolean;
    /* ~ */

    textPosition?: PDFExtractAnnotDot;
    textContent?: string[];
  }

  export interface PDFExtractAnnotPoint {
    x: number;
    y: number;
  }

}
