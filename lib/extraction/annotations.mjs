import { Buffer } from 'node:buffer';
import { compactObj } from "../utils.mjs";

const getPageAnnotation = (viewport, annot) => {
	const result = compactObj(annot);
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
			base64data: annot.file.content ? Buffer.from(annot.file.content).toString('base64') : undefined
		};
	}
	if (result.quadPoints && Array.isArray(result.quadPoints)) {
		const quads = [];
		for (let i = 0; i < result.quadPoints.length; i += 8) {
			if (i + 7 <= result.quadPoints.length) {
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
				for (let i = 0; i < inkList.length; i += 2) {
					if (i + 1 < inkList.length) {
						points.push({ x: inkList[i], y: inkList[i + 1] });
					}
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
