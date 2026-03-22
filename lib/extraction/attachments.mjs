export async function getAttachments(doc) {
	const attachments = await doc.getAttachments();
	let result;
	if (attachments) {
		result = [];
		for (const attachment of Object.entries(attachments)) {
			const attachmentObj = {
				filename: attachment[0],
				description: attachment[1].description
			};
			attachmentObj.base64data = attachment[1].content ? Buffer.from(attachment[1].content).toString('base64') : undefined;
			result.push(attachmentObj);
		}
	}
	return result;
}
