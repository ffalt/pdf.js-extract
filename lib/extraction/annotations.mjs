import { compactObj, toBase64 } from "../utils.mjs";

const toHexColor = arr => {
	if (!arr || !Array.isArray(arr) || arr.length < 3) return undefined;
	return `#${arr.slice(0, 3).map(c => (c | 0).toString(16).padStart(2, '0')).join('')}`;
};

const getPageAnnotation = (viewport, annot) => {
	const result = compactObj(annot);
	if (result.color) result.color = toHexColor(result.color);
	if (result.backgroundColor) result.backgroundColor = toHexColor(result.backgroundColor);
	if (result.borderColor) result.borderColor = toHexColor(result.borderColor);
	if (result.defaultAppearanceData?.fontColor) result.defaultAppearanceData.fontColor = toHexColor(result.defaultAppearanceData.fontColor);
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
			base64data: toBase64(annot.file.content)
		};
	}
	if (result.quadPoints && Array.isArray(result.quadPoints)) {
		const quads = [];
		for (let i = 0; i < result.quadPoints.length; i += 8) {
			if (i + 7 < result.quadPoints.length) {
				quads.push([
					{ x: result.quadPoints[i], y: result.quadPoints[i + 1] },
					{ x: result.quadPoints[i + 2], y: result.quadPoints[i + 3] },
					{ x: result.quadPoints[i + 4], y: result.quadPoints[i + 5] },
					{ x: result.quadPoints[i + 6], y: result.quadPoints[i + 7] }
				]);
			}
		}
		result.quadPoints = quads;
	}
	if (result.inkLists && Array.isArray(result.inkLists)) {
		result.inkLists = result.inkLists.map(inkList => {
			if (Array.isArray(inkList)) {
				const points = [];
				for (let i = 0; i + 1 < inkList.length; i += 2) {
					points.push({ x: inkList[i], y: inkList[i + 1] });
				}
				return points;
			}
			return inkList;
		});
	}
	return result;
};

export async function getPageAnnotations(page) {
	const viewport = page.getViewport({ scale: 1.0 });
	const annotations = await page.getAnnotations();
	if (annotations.length === 0) {
		return undefined;
	}
	return annotations.map(annot => getPageAnnotation(viewport, annot));
}
