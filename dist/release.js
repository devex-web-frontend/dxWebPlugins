'use strict';

var PROJECT_ROOT = process.cwd();
var BOWER_CFG = 'bower.json';
var PACKAGE_CFG = 'package.json';

var PackageFile = require('./release/PackageFile.class.js');
var fs = require('fs');
var path = require('path');
var vcs = require('./release/vcs.js');
var teamcity = require('./teamcity.js');

function getProjectPackageFiles() {
	return [PACKAGE_CFG, BOWER_CFG].reduce(function (result, fileName) {
		var fullFileName = getFullFileName(fileName);

		if (fs.existsSync(fullFileName)) {
			result[fileName] = new PackageFile(fullFileName);
		}
		return result;
	}, {});
}

function getFullFileName(fileName) {
	return path.join(PROJECT_ROOT, fileName);
}

function processPackageFiles(packageFiles, releaseType) {
	Object.keys(packageFiles).forEach(function (fileName) {
		var pkg = packageFiles[fileName];

		pkg.bumpVersion(releaseType);
		pkg.save();
	});
}

module.exports = {

	performRelease: function performRelease(releaseType) {
		var packageFiles = getProjectPackageFiles();
		var version = undefined;

		processPackageFiles(packageFiles, releaseType);

		version = (packageFiles[BOWER_CFG] || packageFiles[PACKAGE_CFG]).getVersion();
		return vcs.init().then(function () {
			return vcs.push(Object.keys(packageFiles), '[release ' + version + ']');
		}).then(function () {
			return vcs.createTag(version);
		}).then(function () {
			teamcity.setReleaseBuildNumber();
			console.log('version ' + version + ' released');
		});
	}
};