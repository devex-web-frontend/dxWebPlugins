'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var SVN = require('svn-spawn');
var Promise = require('promise');

var SVNHelper = (function () {
	function SVNHelper(cwd) {
		_classCallCheck(this, SVNHelper);

		console.log('create helper');
	}

	_createClass(SVNHelper, [{
		key: 'add',
		value: function add(pattern) {
			console.log('add');
		}
	}, {
		key: 'commit',
		value: function commit(tag) {
			console.log('commit');
		}
	}, {
		key: 'createTag',
		value: function createTag(tagName) {
			console.log('tagname');
		}
	}]);

	return SVNHelper;
})();

module.exports = SVNHelper;