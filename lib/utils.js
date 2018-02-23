var utils = {
	xStats: function (page) {
		var x = {};
		page.content.forEach(function (item) {
			var xx = item.x.toFixed(0);
			x[xx] = (x[xx] || 0) + 1;
		});
		return Object.keys(x).map(function (key) {
			return {x: key, val: x[key]};
		}).filter(function (o) {
			return o.val > 1;
		}).sort(function (a, b) {
			return a.x - b.x;
		});
	},
	lineStartWithStrings: function (line, strings) {
		if (line.length < strings.length) return false;
		for (var i = 0; i < strings.length; i++) {
			if (line[i].str.indexOf(strings[i]) !== 0) return false;
		}
		return true;
	},
	extractTextRows: function (lines) {
		return lines.map(function (line) {
			return line.map(function (cell) {
				if (!cell) return null;
				return cell.str;
			});
		});
	},
	extractColumnRows: function (lines, columns, maxdiff) {
		lines = utils.extractColumnLines(lines, columns, maxdiff);
		return utils.extractTextRows(lines);
	},
	extractColumnLines: function (lines, columns, maxdiff) {

		var getCol = function (x) {
			var col = 0;
			for (var i = columns.length; i >= 0; i--) {
				if (x < columns[i]) col = i;
			}
			return col;
		};

		return lines.map(function (line) {
			var row = [];
			line.forEach(function (cell, j) {
				var x = cell.x;
				var col = getCol(x);
				if (row[col]) {
					var before = (line[j - 1]);
					var diff = cell.x - (before.x + before.width);
					if (diff < maxdiff) {
						cell.str = row[col].str + cell.str;
						row[col].merged = true;
						row[col].str = '';
					} else {
						console.log('---------------');
						console.log('warning, double content for cell', JSON.stringify(cell));//, JSON.stringify(line[j - 1]));
						console.log('col', col);
						console.log('diff', diff, 'line-length', line.length);
						console.log(line.filter(function (c) {
							return !c.merged;
						}).map(function (c) {
							c.col = getCol(c.x);
							return c;
						}));
						cell.str = row[col].str + '\n' + cell.str;
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
	extractLines: function (lines, start_strings, end_strings) {
		var includeLine = -1;
		return lines.filter(function (line) {
			if (line.length == 0) return false;
			if (includeLine == -1) {
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
	pageToLines: function (page, maxDiff) {
		var collector = {};
		page.content.forEach(function (text) {
			collector[text.y] = collector[text.y] || [];
			collector[text.y].push(text);
		});
		var list = Object.keys(collector).map(function (key) {
			return {y: key, items: collector[key]};
		}).sort(function (a, b) {
			return a.y - b.y;
		});
		if (maxDiff > 0) {
			for (var i = list.length - 1; i > 0; i--) {
				var r1 = list[i - 1];
				var r2 = list[i];
				var diff = r2.y - r1.y;
				if (diff < maxDiff) {
					r1.items = r1.items.concat(r2.items);
					r2.items = [];
				}
			}
		}
		list.forEach(function (item) {
			item.items = item.items.sort(function (a, b) {
				return a.x - b.x;
			});
		});
		return list.filter(function (item) {
			return item.items.length > 0;
		}).map(function (item) {
			return item.items;
		})
	}
};

module.exports = utils;
