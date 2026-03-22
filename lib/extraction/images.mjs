import { OPS } from '../pdfjs/pdf.mjs';

const getObjAsync = (objs, objId) => new Promise(resolve => objs.get(objId, resolve));

const getImageAsync = (page, objId) => {
	const objs = objId.startsWith('g_') ? page.commonObjs : page.objs;
	return getObjAsync(objs, objId);
};

export async function getPageImages(page) {
	const operatorList = await page.getOperatorList();
	const images = [];
	const processedNames = new Set();
	const fnArray = operatorList.fnArray;
	const argsArray = operatorList.argsArray;

	for (let i = 0; i < fnArray.length; i++) {
		const fn = fnArray[i];

		if (fn === OPS.paintImageXObject || fn === OPS.paintImageXObjectRepeat) {
			// paintImageXObject:       args = [objId, w, h]
			// paintImageXObjectRepeat: args = [objId, scaleX, scaleY, positions]
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
			if (image.data) {
				imageData.base64data = Buffer.from(image.data).toString('base64');
			}
			images.push(imageData);

		} else if (fn === OPS.paintInlineImageXObject) {
			// paintInlineImageXObject: args = [imgData]  (image object directly in operator list)
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
			if (imgData.data) {
				imageData.base64data = Buffer.from(imgData.data).toString('base64');
			}
			images.push(imageData);
		}
	}

	return images.length > 0 ? images : undefined;
}