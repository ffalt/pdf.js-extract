const extractImagesFromPage = async (page, operatorList) => {
	const images = [];
	const fnArray = operatorList.fnArray;
	const argsArray = operatorList.argsArray;
	const processedNames = new Set();

	for (let i = 0; i < fnArray.length; i++) {
		const fn = fnArray[i];
		if (fn === 85 || fn === 86 || fn === 88 || fn === 83 || fn === 84 || fn === 89 || fn === 90) {
			let imageName;
			if (fn === 85 || fn === 83 || fn === 88 || fn === 89) {
				imageName = argsArray[i][0];
			} else if (fn === 86 || fn === 90) {
				imageName = argsArray[i];
			} else if (fn === 84) {
				imageName = argsArray[i][0];
			}

			if (imageName && !processedNames.has(imageName)) {
				processedNames.add(imageName);
				try {
					const image = page.objs.get(imageName);
					if (image && (image.kind === 1 || image.kind === 2)) {
						const imageData = {
							index: images.length,
							width: image.width,
							height: image.height,
							kind: image.kind
						};

						if (image.data) {
							const imageBytes = new Uint8Array(image.data);
							imageData.base64data = Buffer.from(imageBytes).toString('base64');
						}

						images.push(imageData);
					}
				} catch (e) {
				}
			}
		}
	}

	return images;
};

const extractXObjectImages = async (page) => {
	const images = [];
	try {
		const resources = await page.getResources();
		if (!resources?.XObject) return images;

		const xobjectNames = await resources.XObject.getNames();

		for (const name of xobjectNames) {
			const xobject = await resources.XObject.get(name);
			const subtype = await xobject.get("Subtype");

			if (subtype?.name === "Image") {
				const width = await xobject.get("Width");
				const height = await xobject.get("Height");
				const colorSpace = await xobject.get("ColorSpace");
				const bitsPerComponent = await xobject.get("BitsPerComponent");
				const filter = await xobject.get("Filter");

				images.push({
					index: images.length,
					width: width || 0,
					height: height || 0,
					kind: 1,
					colorSpace: colorSpace?.name || "Unknown",
					bitsPerComponent: bitsPerComponent || 8,
					filter: filter?.name || "None"
				});
			}
		}
	} catch (error) {
	}

	return images;
};

const extractInlineImages = async (page, operatorList) => {
	const images = [];

	try {
		const fnArray = operatorList.fnArray;
		const argsArray = operatorList.argsArray;

		for (let i = 0; i < fnArray.length; i++) {
			const fn = fnArray[i];
			const args = argsArray[i];

			if (fn === 74 || fn === 75) {
				if (args && Array.isArray(args) && args.length > 0) {
					const imageDict = args[0];
					if (imageDict && typeof imageDict === "object") {
						images.push({
							index: images.length,
							width: imageDict.W || imageDict.Width || 0,
							height: imageDict.H || imageDict.Height || 0,
							kind: 2,
							colorSpace: imageDict.CS || "Unknown",
							bitsPerComponent: imageDict.BPC || 8,
							filter: imageDict.F || "None"
						});
					}
				}
			}
		}
	} catch (error) {
	}

	return images;
};

const extractFormXObjects = async (page) => {
	const images = [];

	try {
		const resources = await page.getResources();
		if (!resources?.XObject) return images;

		const xobjectNames = await resources.XObject.getNames();

		for (const name of xobjectNames) {
			const xobject = await resources.XObject.get(name);
			const subtype = await xobject.get("Subtype");

			if (subtype?.name === "Form") {
				const formResources = await xobject.get("Resources");
				if (formResources?.XObject) {
					const formXObjectNames = await formResources.XObject.getNames();

					for (const formName of formXObjectNames) {
						const formImage = await formResources.XObject.get(formName);
						const formSubtype = await formImage.get("Subtype");

						if (formSubtype?.name === "Image") {
							const width = await formImage.get("Width");
							const height = await formImage.get("Height");
							const colorSpace = await formImage.get("ColorSpace");
							const bitsPerComponent = await formImage.get("BitsPerComponent");
							const filter = await formImage.get("Filter");

							images.push({
								index: images.length,
								width: width || 0,
								height: height || 0,
								kind: 3,
								colorSpace: colorSpace?.name || "Unknown",
								bitsPerComponent: bitsPerComponent || 8,
								filter: filter?.name || "None"
							});
						}
					}
				}
			}
		}
	} catch (error) {
	}

	return images;
};

export async function getPageImages(page) {
	const operatorList = await page.getOperatorList();
	const images = [];

	try {
		const extractedImages = await extractImagesFromPage(page, operatorList);
		images.push(...extractedImages);
	} catch (e) {
	}

	try {
		const xobjectImages = await extractXObjectImages(page);
		images.push(...xobjectImages);
	} catch (e) {
	}

	try {
		const inlineImages = await extractInlineImages(page, operatorList);
		images.push(...inlineImages);
	} catch (e) {
	}

	try {
		const formXObjects = await extractFormXObjects(page);
		images.push(...formXObjects);
	} catch (e) {
	}

	if (images.length > 0) {
		const uniqueImages = [];
		const seen = new Set();
		images.forEach((img, index) => {
			const key = `${img.width}_${img.height}_${img.kind}`;
			if (!seen.has(key)) {
				seen.add(key);
				img.index = uniqueImages.length;
				uniqueImages.push(img);
			}
		});
		if (uniqueImages.length > 0) {
			return uniqueImages;
		}
	}
}

