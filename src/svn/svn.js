let SVN  = require('svn-spawn');
let Promise = require('promise');

class SVNHelper {
	constructor(cwd) {
		console.log('create helper');
	}

	add(pattern) {
		console.log('add');
	}

	commit(tag) {
		console.log('commit');
	}

	createTag(tagName) {
		console.log('tagname');
	}
}

module.exports = SVNHelper;