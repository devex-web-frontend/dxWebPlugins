'use strict';

var PROJECT_ROOT = process.cwd();
var packageFiles = ['bower.json', 'package.json'];
var PATCH = 'patch';
var MINOR = 'minor';
var MAJOR = 'major';

var versionPartIndexes = [MAJOR, MINOR, PATCH].reduce(function (prevValue, currentValue, index) {
	prevValue[currentValue] = index;
	return prevValue;
}, {});

var SVNHelpers = new (require('./svn/svn.js'))(PROJECT_ROOT);
var fs = require('fs');
var path = require('path');
var releaseVersion = undefined;

function getFullFileName(fileName) {
	return path.join(PROJECT_ROOT, fileName);
}

function bumpVersion(version, releaseType) {
	var affectedIndex = versionPartIndexes[releaseType];

	return version.split('.').map(function (value, index) {
		if (index === affectedIndex) {
			value = parseInt(value) + 1;
		}
		if (index > affectedIndex) {
			value = 0;
		}

		return value;
	}).join('.');
}
function setReleaseVersion(version) {
	releaseVersion = version;
}

function updateFile(fullFileName, releaseType) {
	var fileData = JSON.parse(fs.readFileSync(fullFileName, 'utf8'));
	var currentVersion = fileData.version;
	var newVersion = bumpVersion(currentVersion, releaseType);

	fileData.version = newVersion;
	setReleaseVersion(newVersion);

	fs.writeFileSync(fullFileName, JSON.stringify(fileData, null, 2));
}

function releasePackage(releaseType) {
	packageFiles.forEach(function (fileName) {
		var fullFileName = getFullFileName(fileName);

		if (fs.existsSync(fullFileName)) {
			updateFile(fullFileName, releaseType);
		}
	});
}

module.exports = {
	releaseTypes: {
		PATCH: PATCH,
		MINOR: MINOR,
		MAJOR: MAJOR
	},

	performRelease: function performRelease(releaseType) {
		releasePackage(releaseType);

		return SVNHelpers.commit('[release ' + releaseVersion + ']').then(function () {
			return SVNHelpers.createTag(releaseVersion);
		}).then(function () {
			console.log('finish');
		});
	},

	test: function test() {
		releasePackage(MAJOR);
	}
};