import { toBase64 } from '../utils.mjs';

export async function getAttachments(doc) {
	const attachments = await doc.getAttachments();
	if (!attachments) {
		return undefined;
	}
	const result = [];
	for (const [filename, data] of Object.entries(attachments)) {
		result.push({
			filename,
			description: data.description,
			base64data: toBase64(data.content)
		});
	}
	return result.length > 0 ? result : undefined;
}
