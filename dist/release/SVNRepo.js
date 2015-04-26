'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var SVN = require('svn-spawn');
var Promise = require('promise');

var SVNRepo = (function () {
	function SVNRepo(cwd) {
		_classCallCheck(this, SVNRepo);

		this.SVNSpawn = new SVN(cwd);
	}

	_createClass(SVNRepo, [{
		key: 'add',
		value: function add(files) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				return _this.SVNSpawn.add(files, function (err, data) {
					err ? reject(err) : resolve(data);
				});
			});
		}
	}, {
		key: 'commit',
		value: function commit(comment) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				return _this2.SVNSpawn.commit(comment, function (err, data) {
					err ? reject(err) : resolve(data);
				});
			});
		}
	}, {
		key: 'getInfo',
		value: function getInfo() {
			var _this3 = this;

			return new Promise(function (resolve, reject) {
				return _this3.SVNSpawn.getInfo(function (err, data) {
					err ? reject(err) : resolve(data);
				});
			});
		}
	}, {
		key: 'createTag',
		value: function createTag(tagName) {
			var _this4 = this;

			return new Promise(function (resolve, reject) {
				return _this4.getInfo().then(function (info) {
					var trunkFolder = info.url;
					var tagsFolder = trunkFolder.replace('trunk', 'tags');
					var destination = tagsFolder + '/' + tagName;

					return _this4.SVNSpawn.cmd(['copy', trunkFolder, destination, '-m="tag ' + tagName + '"'], function (err, data) {
						err ? reject(err) : resolve(data);
					});
				});
			});
		}
	}]);

	return SVNRepo;
})();

module.exports = SVNRepo;