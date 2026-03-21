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
	return result;
};

export async function getPageAnnotations(page) {
	const viewport = page.getViewport({ scale: 1.0 });
	const annotations = await page.getAnnotations();
	if (annotations.length > 0) {
		return annotations
		.map((annot) => getPageAnnotation(viewport, annot));
	}
};
