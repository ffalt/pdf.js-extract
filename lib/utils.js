const utils = {
	xStats: page => {
		const x = {};
		page.content.forEach(item => {
			const xx = item.x.toFixed(0);
			x[xx] = (x[xx] || 0) + 1;
		});
		return Object.keys(x).map(key => ({x: key, val: x[key]})).filter(o => o.val > 1).sort((a, b) => a.x - b.x);
	},
	lineStartWithStrings: (line, strings) => {
		if (line.length < strings.length) return false;
		for (let i = 0; i < strings.length; i++) {
			if (line[i].str.indexOf(strings[i]) !== 0) return false;
		}
		return true;
	},
	extractTextRows: lines => lines.map(line => line.map(cell => {
		if (!cell) return null;
		return cell.str;
	})),
	extractColumnRows: (lines, columns, maxdiff) => {
		lines = utils.extractColumnLines(lines, columns, maxdiff);
		return utils.extractTextRows(lines);
	},
	extractColumnLines: (lines, columns, maxdiff) => {

		const getCol = x => {
			let col = 0;
			for (let i = columns.length; i >= 0; i--) {
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
					const before = (line[j - 1]);
					const diff = cell.x - (before.x + before.width);
					if (diff < maxdiff) {
						cell.str = row[col].str + cell.str;
						row[col].merged = true;
						row[col].str = "";
					} else {
						console.log("---------------");
						console.log("warning, double content for cell", JSON.stringify(cell));
						console.log("col", col);
						console.log("diff", diff, "line-length", line.length);
						console.log(line.filter(c => !c.merged).map(c => {
							c.col = getCol(c.x);
							return c;
						}));
						cell.str = row[col].str + "\n" + cell.str;
					}
				}
				while (row.length <= col) {
					row.push(null);
				}
				row[col] = cell;
			});
			return row;
		});
	},
	extractLines: (lines, start_strings, end_strings) => {
		let includeLine = -1;
		return lines.filter(line => {
			if (line.length === 0) return false;
			if (includeLine === -1) {
				if (utils.lineStartWithStrings(line, start_strings)) {
					includeLine = 0;
				}
			} else if (includeLine > -1) {
				if (utils.lineStartWithStrings(line, end_strings)) {
					includeLine = -1;
				} else {
					includeLine++;
				}
			}
			return includeLine > 0;
		});
	},
	pageToLines: (page, maxDiff) => {
		const collector = {};
		page.content.forEach(text => {
			collector[text.y] = collector[text.y] || [];
			collector[text.y].push(text);
		});
		const list = Object.keys(collector).map(key => ({y: key, items: collector[key]})).sort((a, b) => a.y - b.y);
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
		return list.filter(item => item.items.length > 0).map(item => item.items)
	}
};

module.exports = utils;
