import { Util } from "../pdfjs/pdf.mjs";

const normalizeTransform = transform => transform.map(v => v === 0 ? 0 : v);

const getPageTextItem = (page, viewport, item, content) => {
	const tx = Util.transform(viewport.transform, item.transform);
	const style = content.styles[item.fontName] ?? {};
	const fontSize = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
	// get font name, see https://github.com/mozilla/pdf.js/pull/10753, https://github.com/mozilla/pdf.js/issues/15651
	const font = page.commonObjs?.get(item.fontName);
	return {
		str: item.str,
		x: tx[4],
		y: tx[5],
		width: item.width,
		height: item.height === 0 ? fontSize : item.height,
		transform: normalizeTransform(item.transform),
		font: {
			size: fontSize,
			name: font?.name,
			family: style.fontFamily,
			vertical: style.vertical,
			ascent: isNaN(style.ascent) || style.ascent === null ? undefined : style.ascent,
			descent: isNaN(style.descent) || style.descent === null ? undefined : style.descent
		},
		dir: item.dir,
		hasEOL: item.hasEOL
	};
};

export async function getPageContent(page, textExtractOptions) {
	const viewport = page.getViewport({ scale: 1.0 });
	const content = await page.getTextContent(textExtractOptions);
	return content.items
	.map(item => getPageTextItem(page, viewport, item, content));
}

