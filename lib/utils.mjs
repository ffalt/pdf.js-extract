import { Buffer } from 'node:buffer';

export function toBase64(data) {
	return data ? Buffer.from(data).toString('base64') : undefined;
}

export function xStats(page) {
	const x = {};
	page.content.forEach(item => {
		const xx = item.x.toFixed(0);
		x[xx] = (x[xx] || 0) + 1;
	});
	return Object.keys(x)
	.map(key => ({ x: key, val: x[key] }))
	.filter(o => o.val > 1)
	.sort((a, b) => a.x - b.x);
}

export function lineStartWithStrings(line, strings) {
	if (line.length < strings.length) return false;
	for (let i = 0; i < strings.length; i++) {
		if (line[i].str.indexOf(strings[i]) !== 0) return false;
	}
	return true;
}

export function extractTextRows(lines) {
	return lines.map(line =>
			line.map(cell => {
				if (!cell) return null;
				return cell.str;
			})
	);
}

export function extractColumnRows(lines, columns, maxdiff) {
	const colLines = extractColumnLines(lines, columns, maxdiff);
	return extractTextRows(colLines);
}

export function extractColumnLines(lines, columns, maxdiff) {
	const getCol = x => {
		let col = 0;
		for (let i = columns.length - 1; i >= 0; i--) {
			if (x < columns[i]) col = i;
		}
		return col;
	};

	return lines.map(line => {
		const row = [];
		line.forEach((cell, j) => {
			const x = cell.x;
			const col = getCol(x);
			if (row[col]) {
				const before = line[j - 1];
				if (!before) {
					return;
				}
				const diff = cell.x - (before.x + before.width);
				if (diff < maxdiff) {
					cell.str = row[col].str + cell.str;
					row[col].merged = true;
					row[col].str = "";
				} else {
					cell.str = `${row[col].str}\n${cell.str}`;
				}
			}
			while (row.length <= col) {
				row.push(null);
			}
			row[col] = cell;
		});
		return row;
	});
}

export function extractLines(lines, startStrings, endStrings) {
	let includeLine = -1;
	return lines.filter(line => {
		if (line.length === 0) return false;
		if (includeLine === -1) {
			if (lineStartWithStrings(line, startStrings)) {
				includeLine = 1;
			}
		} else if (includeLine > -1) {
			if (lineStartWithStrings(line, endStrings)) {
				includeLine = -1;
			} else {
				includeLine++;
			}
		}
		return includeLine > 0;
	});
}

export function pageToLines(page, maxDiff) {
	const collector = {};
	page.content.forEach(text => {
		collector[text.y] = collector[text.y] || [];
		collector[text.y].push(text);
	});
	const list = Object.keys(collector)
	.map(key => ({ y: key, items: collector[key] }))
	.sort((a, b) => a.y - b.y);
	if (maxDiff > 0) {
		for (let i = list.length - 1; i > 0; i--) {
			const r1 = list[i - 1];
			const r2 = list[i];
			const diff = r2.y - r1.y;
			if (diff < maxDiff) {
				r1.items = r1.items.concat(r2.items);
				r2.items = [];
			}
		}
	}
	list.forEach(item => {
		item.items = item.items.sort((a, b) => a.x - b.x);
	});
	return list
	.filter(item => item.items.length > 0)
	.map(item => item.items);
}

export function extractAllPagesTextRows(pages, maxDiff) {
	return pages.map(page => {
		const lines = pageToLines(page, maxDiff);
		return extractTextRows(lines);
	});
}

function isNumericKeyObject(obj) {
	if (typeof obj !== 'object' || obj === null) return false;
	const keys = Object.keys(obj);
	if (keys.length === 0) return false;

	const numKeys = keys.map(k => {
		const num = Number(k);
		return Number.isInteger(num) && num >= 0 ? num : null;
	});

	if (numKeys.some(k => k === null)) return false;

	numKeys.sort((a, b) => a - b);
	for (let i = 0; i < numKeys.length; i++) {
		if (numKeys[i] !== i) return false;
	}
	return true;
}

export function compactObj(obj) {
	if (obj === null || obj === undefined) {
		return undefined;
	}
	if (isNumericKeyObject(obj)) {
		return Object.values(obj);
	}
	return Object.fromEntries(Object.entries(obj)
	.filter(([, v]) => v != null)
	.map(([k, v]) => {
		if (ArrayBuffer.isView(v)) {
			return [k, Array.from(v)];
		} else if (Array.isArray(v)) {
			return [k, v.map(item => {
				if (typeof item === 'object' && item !== null) {
					return compactObj(item);
				}
				return item;
			})];
		} else if (typeof v === 'object') {
			return [k, compactObj(v)];
		} else {
			return [k, v];
		}
	}));
}
