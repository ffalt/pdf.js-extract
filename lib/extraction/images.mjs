import { Buffer } from 'node:buffer';
import { OPS, Util } from '../pdfjs/pdf.mjs';

const getObjAsync = (objs, objId) => new Promise(resolve => objs.get(objId, resolve));

const getImageAsync = (page, objId) => {
	const objs = objId.startsWith('g_') ? page.commonObjs : page.objs;
	return getObjAsync(objs, objId);
};

const findLastSetMatrixBefore = (fnArray, argsArray, index) => {
	for (let i = index - 1; i >= 0; i--) {
		if (fnArray[i] === OPS.setMatrix || fnArray[i] === OPS.transform) {
			return argsArray[i];
		}
	}
	return null;
};

const applyTransform = (transform, matrix) => {
	if (!transform || !matrix || transform.length !== 6 || matrix.length !== 6) {
		return matrix || transform;
	}
	return Util.transform(transform, matrix);
};

export async function getPageImages(page) {
	const operatorList = await page.getOperatorList();
	const images = [];
	const processedNames = new Set();
	const fnArray = operatorList.fnArray;
	const argsArray = operatorList.argsArray;
	const viewport = page.getViewport({ scale: 1.0 });

	for (let i = 0; i < fnArray.length; i++) {
		const fn = fnArray[i];

		if (fn === OPS.paintImageXObject || fn === OPS.paintImageXObjectRepeat) {
			const args = argsArray[i];
			if (!Array.isArray(args) || args.length < 1) continue;
			const objId = args[0];
			if (!objId || processedNames.has(objId)) continue;
			processedNames.add(objId);

			const image = await getImageAsync(page, objId);
			if (!image || !image.width || !image.height) continue;

			const imageData = {
				index: images.length,
				width: image.width,
				height: image.height,
				kind: image.kind
			};

			const matrix = findLastSetMatrixBefore(fnArray, argsArray, i);
			if (matrix && Array.isArray(matrix) && matrix.length === 6) {
				const transform = applyTransform(viewport.transform, matrix);
				imageData.x = transform[4];
				imageData.y = transform[5];
				imageData.transform = matrix;
				if (fn === OPS.paintImageXObjectRepeat && Array.isArray(args[3])) {
					imageData.positions = args[3];
				}
			}

			if (image.data) {
				imageData.base64data = Buffer.from(image.data).toString('base64');
			}
			images.push(imageData);

		} else if (fn === OPS.paintInlineImageXObject) {
			const args = argsArray[i];
			if (!Array.isArray(args) || args.length < 1) continue;
			const imgData = args[0];
			if (!imgData || !imgData.width || !imgData.height) continue;

			const imageData = {
				index: images.length,
				width: imgData.width,
				height: imgData.height,
				kind: imgData.kind
			};

			const matrix = findLastSetMatrixBefore(fnArray, argsArray, i);
			if (matrix && Array.isArray(matrix) && matrix.length === 6) {
				const transform = applyTransform(viewport.transform, matrix);
				imageData.x = transform[4];
				imageData.y = transform[5];
				imageData.transform = matrix;
			}

			if (imgData.data) {
				imageData.base64data = Buffer.from(imgData.data).toString('base64');
			}
			images.push(imageData);
		}
	}

	return images.length > 0 ? images : undefined;
}
