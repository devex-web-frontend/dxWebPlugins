let SVNHelpers = new (require('./svn/svn.js'));

module.exports = {
	sayHi() {
		console.log(conf.user);
	},

	test() {
		SVNHelpers.add();
		SVNHelpers.commit();
		SVNHelpers.createTag();
	}
};