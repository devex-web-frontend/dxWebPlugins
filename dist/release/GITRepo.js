'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var GIT = require('gift');
var Promise = require('promise');

var GITRepo = (function () {
	function GITRepo(cwd) {
		_classCallCheck(this, GITRepo);

		this.GITSpawn = GIT(cwd);
	}

	_createClass(GITRepo, [{
		key: 'add',
		value: function add(files) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				return _this.GITSpawn.add(files, function (err, data) {
					err ? reject(err) : resolve(data);
				});
			});
		}
	}, {
		key: 'commit',
		value: function commit(comment) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				return _this2.GITSpawn.commit(comment, function (err, data) {
					err ? reject(err) : resolve(data);
				});
			});
		}
	}, {
		key: 'getStatus',
		value: function getStatus() {
			var _this3 = this;

			return new Promise(function (resolve, reject) {
				return _this3.GITSpawn.status(function (err, data) {
					err ? reject(err) : resolve(data);
				});
			});
		}
	}, {
		key: 'push',
		value: function push(dest) {
			var _this4 = this;

			return new Promise(function (resolve, reject) {
				return _this4.GITSpawn.remote_push(dest, function (err, data) {
					err ? reject(err) : resolve(data);
				});
			});
		}
	}, {
		key: 'sync',
		value: function sync() {
			var _this5 = this;

			return new Promise(function (resolve, reject) {
				return _this5.GITSpawn.sync(function (err, data) {
					err ? reject(err) : resolve(data);
				});
			});
		}
	}, {
		key: 'createTag',
		value: function createTag(tagName) {
			var _this6 = this;

			return new Promise(function (resolve, reject) {
				return _this6.GITSpawn.create_tag(tagName, function (err, data) {
					err ? reject(err) : resolve(data);
				});
			});
		}
	}]);

	return GITRepo;
})();

module.exports = GITRepo;