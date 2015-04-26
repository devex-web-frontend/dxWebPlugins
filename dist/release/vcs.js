'use strict';

var PROJECT_ROOT = process.cwd();

var Promise = require('promise');
var exec = require('child_process').exec;

var SVNRepoClass = require('./SVNRepo.js');
var GITRepoClass = require('./GITRepo.js');

var SVNRepo = undefined;
var GITRepo = undefined;

function tryToCreateSVNRepo() {
	return new Promise(function (resolve) {
		exec('svn info', { cwd: PROJECT_ROOT }, function (err) {
			if (!err) {
				SVNRepo = new SVNRepoClass(PROJECT_ROOT);
			}

			resolve();
		});
	});
}

function tryToCreateGITRepo() {
	return new Promise(function (resolve) {
		exec('git status', { cwd: process.cwd() }, function (err) {
			if (!err) {
				GITRepo = new GITRepoClass(PROJECT_ROOT);
				console.log(GITRepo);
			}
			resolve();
		});
	});
}

module.exports = {
	init: function init() {
		console.log('init');

		return Promise.all([tryToCreateSVNRepo(), tryToCreateGITRepo()]);
	},
	isGIT: function isGIT() {
		return !GITRepo;
	},
	isSVN: function isSVN() {
		return !SVNRepo;
	},

	push: function push(files, comment) {
		var result = undefined;

		if (GITRepo) {
			result = GITRepo.add(files).then(function () {
				return GITRepo.commit(comment);
			}).then(function () {
				return GITRepo.sync();
			});
		}

		if (SVNRepo) {
			result = SVNRepo.commit(comment);
		}

		return result;
	},

	createTag: function createTag(tagName) {
		var result = undefined;

		if (GITRepo) {}

		if (SVNRepo) {
			result = SVNRepo.createTag(tagName);
		}

		return result;
	}
};