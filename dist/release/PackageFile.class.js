'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var fs = require('fs');

var _require$RELEASE_TYPES = require('./const.js').RELEASE_TYPES;

var PATCH = _require$RELEASE_TYPES.PATCH;
var MINOR = _require$RELEASE_TYPES.MINOR;
var MAJOR = _require$RELEASE_TYPES.MAJOR;

var versionPartIndexes = [MAJOR, MINOR, PATCH].reduce(function (prevValue, currentValue, index) {
	prevValue[currentValue] = index;
	return prevValue;
}, {});

function readFile(fullFileName) {
	return JSON.parse(fs.readFileSync(fullFileName, 'utf8'));
}

function saveFile(fullFileName, data) {
	return fs.writeFileSync(fullFileName, JSON.stringify(data, null, 2));
}

module.exports = (function () {
	function PackageFile(fullFileName) {
		_classCallCheck(this, PackageFile);

		this.packageData = readFile(fullFileName);
		this.fullFileName = fullFileName;
	}

	_createClass(PackageFile, [{
		key: 'getVersion',
		value: function getVersion() {
			return this.packageData.version;
		}
	}, {
		key: 'bumpVersion',
		value: function bumpVersion(releaseType) {
			var affectedIndex = versionPartIndexes[releaseType];

			this.packageData.version = this.packageData.version.split('.').map(function (value, index) {
				if (index === affectedIndex) {
					value = parseInt(value) + 1;
				}
				if (index > affectedIndex) {
					value = 0;
				}

				return value;
			}).join('.');
		}
	}, {
		key: 'save',
		value: function save() {
			saveFile(this.fullFileName, this.packageData);
		}
	}]);

	return PackageFile;
})();