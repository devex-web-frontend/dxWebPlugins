const PROJECT_ROOT = process.cwd();

let Promise = require('promise');
let exec = require('child_process').exec;

let SVNRepoClass = require('./SVNRepo.js');
let GITRepoClass = require('./GITRepo.js');

let SVNRepo;
let GITRepo;

function tryToCreateSVNRepo() {
	return new Promise(function(resolve) {
		exec('svn info', {cwd: PROJECT_ROOT}, function(err) {
			if (!err) {
				SVNRepo = new SVNRepoClass(PROJECT_ROOT);
			}

			resolve();
		})
	})
}

function tryToCreateGITRepo() {
	return new Promise(function(resolve) {
		exec('git status', {cwd: process.cwd()}, function(err) {
			if (!err) {
				GITRepo = new GITRepoClass(PROJECT_ROOT);
				console.log(GITRepo);
			}
			resolve();
		})
	})
}



module.exports = {
	init() {
		console.log('init');

		return Promise.all([tryToCreateSVNRepo(), tryToCreateGITRepo()]);
	},
	isGIT() {
		return !GITRepo;
	},
	isSVN() {
		return !SVNRepo;
	},

	push(files, comment) {
		let result;

		if (GITRepo) {
			result = GITRepo.add(files)
				.then(() => GITRepo.commit(comment))
				.then(() => GITRepo.sync());
		}

		if (SVNRepo) {
			result = SVNRepo.commit(comment);
		}

		return result;
	},

	createTag(tagName) {
		let result;

		if (GITRepo) {

		}

		if (SVNRepo) {
			result = SVNRepo.createTag(tagName);
		}

		return result;
	}
};