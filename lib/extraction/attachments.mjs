import { Buffer } from 'node:buffer';

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
			base64data: data.content ? Buffer.from(data.content).toString('base64') : undefined
		});
	}
	return result.length > 0 ? result : undefined;
}
