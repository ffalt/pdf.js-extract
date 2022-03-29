declare module "pdf.js-extract" {
	export class PDFExtract {
		extract(filename: string, options: PDFExtractOptions, callback: (err: Error | null, pdf?: PDFExtractResult) => void): void;
		extract(filename: string, options?: PDFExtractOptions): Promise<PDFExtractResult>;

		extractBuffer(buffer: Buffer, options: PDFExtractOptions, callback: (err: Error | null, pdf?: PDFExtractResult) => void): void;
		extractBuffer(buffer: Buffer, options?: PDFExtractOptions): Promise<PDFExtractResult>;
	}

	export interface PDFExtractOptions {
		firstPage?: number; // start extract at page nr, The default value is `1`
		lastPage?: number; //  stop extract at page nr, no default value
		password?: string; //  for decrypting password-protected PDFs., no default value
		verbosity?: number; // log level of pdf.js, default value is `-1`
		normalizeWhitespace?: boolean; //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
		disableCombineTextItems?: boolean; // do not attempt to combine  same line {@link TextItem}'s. The default value is `false`.
	}

	export interface PDFExtractResult {
		filename?: string;
		meta?: {
			info?: {
				PDFFormatVersion?: string;
				IsAcroFormPresent?: boolean,
				IsCollectionPresent?: boolean,
				IsLinearized?: boolean,
				IsXFAPresent?: boolean,
				Title?: string;
				Author?: string;
				Creator?: string;
				Producer?: string;
				CreationDate?: string;
				ModDate?: string;
			},
			metadata?: {
				[name: string]: string;
			}
		};
		pages: Array<PDFExtractPage>;
		pdfInfo: {
			numPages: number;
			fingerprint: string;
		}
	}

	export interface PDFExtractPage {
		pageInfo: {
			num: number;
			scale: number;
			rotation: number;
			offsetX: number;
			offsetY: number;
			width: number;
			height: number;
		};
		links: Array<string>;
		content: Array<PDFExtractText>;
	}

	export interface PDFExtractText {
		x: number;
		y: number;
		str: string;
		dir: string;
		width: number;
		height: number;
		fontName: string;
	}
}
