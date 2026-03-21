import { compactObj } from "../utils.mjs";

export async function getMetadata(doc) {
	const data = await doc.getMetadata();
	return {
		info: compactObj(data.info),
		metadata: data.metadata ? compactObj(data.metadata.getAll()) : undefined,
	};
};
