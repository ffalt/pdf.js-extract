const fs = require("fs");
const pdfjsLib = require("./pdfjs/pdf.js");

const _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}

	return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);
		if (staticProps) defineProperties(Constructor, staticProps);
		return Constructor;
	};
}();

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

var NodeCMapReaderFactory = function () {
	function NodeCMapReaderFactory(_ref) {
		var _ref$baseUrl = _ref.baseUrl,
			baseUrl = _ref$baseUrl === undefined ? null : _ref$baseUrl,
			_ref$isCompressed = _ref.isCompressed,
			isCompressed = _ref$isCompressed === undefined ? false : _ref$isCompressed;
		_classCallCheck(this, NodeCMapReaderFactory);
		this.baseUrl = baseUrl;
		this.isCompressed = isCompressed;
	}

	_createClass(NodeCMapReaderFactory, [{
		key: "fetch",
		value: function fetch(_ref2) {
			var _this = this;
			var name = _ref2.name;
			if (!this.baseUrl) {
				return Promise.reject(new Error("The CMap baseUrl parameter must be specified, ensure that the cMapUrl and cMapPacked API parameters are provided."));
			}
			if (!name) {
				return Promise.reject(new Error("CMap name must be specified."));
			}
			return new Promise(function (resolve, reject) {
				var url = _this.baseUrl + name + (_this.isCompressed ? ".bcmap" : "");
				fs.readFile(url, function (error, data) {
					if (error || !data) {
						reject(new Error("Unable to load " + (_this.isCompressed ? "binary " : "") + "CMap at: " + url));
						return;
					}
					resolve({
						cMapData: new Uint8Array(data),
						compressionType: _this.isCompressed ? pdfjsLib.CMapCompressionType.BINARY : pdfjsLib.CMapCompressionType.NONE
					});
				});
			});
		}
	}]);

	return NodeCMapReaderFactory;
}();

class DOMCMapReaderFactory {
	constructor({baseUrl = null, isCompressed = false,}) {
		this.baseUrl = baseUrl;
		this.isCompressed = isCompressed;
	}

	fetch({name,}) {
		if (!this.baseUrl) {
			return Promise.reject(new Error(
				"The CMap baseUrl parameter must be specified, ensure that the cMapUrl and cMapPacked API parameters are provided."));
		}
		if (!name) {
			return Promise.reject(new Error("CMap name must be specified."));
		}
		var _this = this;
		return new Promise(function (resolve, reject) {
			var url = _this.baseUrl + name + (_this.isCompressed ? ".bcmap" : "");
			fs.readFile(url, function (error, data) {
				if (error || !data) {
					reject(new Error("Unable to load " + (_this.isCompressed ? "binary " : "") + "CMap at: " + url));
					return;
				}
				resolve({
					cMapData: new Uint8Array(data),
					compressionType: _this.isCompressed ? CMapCompressionType.BINARY : CMapCompressionType.NONE
				});
			});
		});
	}
}

module.exports = NodeCMapReaderFactory;
