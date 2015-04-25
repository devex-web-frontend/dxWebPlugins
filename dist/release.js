'use strict';

var SVNHelpers = new (require('./svn/svn.js'))();

module.exports = {
	sayHi: function sayHi() {
		console.log(conf.user);
	},

	test: function test() {
		SVNHelpers.add();
		SVNHelpers.commit();
		SVNHelpers.createTag();
	}
};