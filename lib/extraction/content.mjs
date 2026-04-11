import { OPS, Util } from "../pdfjs/pdf.mjs";

const normalizeTransform = transform => transform.map(v => v === 0 ? 0 : v);

const translateMatrix = (m, tx, ty) => [m[0], m[1], m[2], m[3], m[0] * tx + m[2] * ty + m[4], m[1] * tx + m[3] * ty + m[5]];

async function extractTextFillColors(page) {
	const operatorList = await page.getOperatorList();
	const { fnArray, argsArray } = operatorList;
	let fillColor = "#000000";
	let ctm = [1, 0, 0, 1, 0, 0];
	let textMatrix = [1, 0, 0, 1, 0, 0];
	let textLineMatrix = [1, 0, 0, 1, 0, 0];
	let fontSize = 0;
	let leading = 0;
	const saveStack = [];
	const colorEntries = [];
	for (let i = 0; i < fnArray.length; i++) {
		const args = argsArray[i];
		switch (fnArray[i]) {
			case OPS.save:
				saveStack.push({ ctm, fillColor, textMatrix, textLineMatrix, fontSize, leading });
				break;
			case OPS.restore:
				if (saveStack.length > 0) {
					({ ctm, fillColor, textMatrix, textLineMatrix, fontSize, leading } = saveStack.pop());
				}
				break;
			case OPS.transform:
				ctm = Util.transform(ctm, args);
				break;
			case OPS.paintFormXObjectBegin:
				saveStack.push({ ctm, fillColor, textMatrix, textLineMatrix, fontSize, leading });
				if (args[0]) {
					ctm = Util.transform(ctm, args[0]);
				}
				break;
			case OPS.paintFormXObjectEnd:
				if (saveStack.length > 0) {
					({ ctm, fillColor, textMatrix, textLineMatrix, fontSize, leading } = saveStack.pop());
				}
				break;
			case OPS.setFillRGBColor:
				fillColor = args[0];
				break;
			case OPS.setFillTransparent:
				fillColor = undefined;
				break;
			case OPS.beginText:
				textMatrix = [1, 0, 0, 1, 0, 0];
				textLineMatrix = [1, 0, 0, 1, 0, 0];
				break;
			case OPS.setTextMatrix: {
				const m = args[0];
				textMatrix = [m[0], m[1], m[2], m[3], m[4], m[5]];
				textLineMatrix = textMatrix.slice();
				break;
			}
			case OPS.moveText:
				textLineMatrix = translateMatrix(textLineMatrix, args[0], args[1]);
				textMatrix = textLineMatrix.slice();
				break;
			case OPS.setLeadingMoveText:
				leading = -args[1];
				textLineMatrix = translateMatrix(textLineMatrix, args[0], args[1]);
				textMatrix = textLineMatrix.slice();
				break;
			case OPS.nextLine:
				textLineMatrix = translateMatrix(textLineMatrix, 0, -leading);
				textMatrix = textLineMatrix.slice();
				break;
			case OPS.setFont:
				fontSize = args[1];
				break;
			case OPS.setLeading:
				leading = args[0];
				break;
			case OPS.showText: {
				const tsm = [fontSize, 0, 0, fontSize, 0, 0];
				const pos = Util.transform(ctm, Util.transform(textMatrix, tsm));
				colorEntries.push({ x: pos[4], y: pos[5], color: fillColor });
				break;
			}
			default: {
				// nop
			}

		}
	}
	return colorEntries;
}

function findFillColor(colorEntries, searchStart, itemX, itemY) {
	for (let i = searchStart; i < colorEntries.length; i++) {
		const entry = colorEntries[i];
		if (Math.abs(entry.x - itemX) < 5 && Math.abs(entry.y - itemY) < 5) {
			let nextIdx = i + 1;
			while (nextIdx < colorEntries.length &&
				Math.abs(colorEntries[nextIdx].x - itemX) < 5 &&
				Math.abs(colorEntries[nextIdx].y - itemY) < 5) {
				nextIdx++;
			}
			return { color: entry.color, nextIdx };
		}
	}
	return null;
}

const getPageTextItem = (page, viewport, item, content, fillColor) => {
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
			color: fillColor,
			vertical: style.vertical,
			ascent: isNaN(style.ascent) || style.ascent === null ? undefined : style.ascent,
			descent: isNaN(style.descent) || style.descent === null ? undefined : style.descent
		},
		dir: item.dir,
		hasEOL: item.hasEOL
	};
};

export async function getPageContent(page, textExtractOptions, includeColors) {
	const viewport = page.getViewport({ scale: 1.0 });
	if (!includeColors) {
		const content = await page.getTextContent(textExtractOptions);
		return content.items.map(item => getPageTextItem(page, viewport, item, content));
	}
	const [content, colorEntries] = await Promise.all([
		page.getTextContent(textExtractOptions),
		extractTextFillColors(page)
	]);
	let entryIdx = 0;
	let lastColor = colorEntries[0]?.color ?? "#000000";
	return content.items.map(item => {
		if (item.str && item.str.trim()) {
			const result = findFillColor(colorEntries, entryIdx, item.transform[4], item.transform[5]);
			if (result) {
				if (result.color !== undefined) {
					lastColor = result.color;
				}
				entryIdx = result.nextIdx;
			}
		}
		return getPageTextItem(page, viewport, item, content, lastColor);
	});
}

