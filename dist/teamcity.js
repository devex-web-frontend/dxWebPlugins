'use strict';

var PROJECT_ROOT = process.cwd();
var BOWER_CFG = 'bower.json';
var PACKAGE_CFG = 'package.json';

var fs = require('fs');
var path = require('path');
var propertiesParser = require('properties').parse;

var PackageFile = require('./release/PackageFile.class.js');

function isCIEnv() {
	return !!process.env.TEAMCITY_VERSION;
}

function getFullFileName(fileName) {
	return path.join(PROJECT_ROOT, fileName);
}

function getMainPackageFile() {
	return [BOWER_CFG, PACKAGE_CFG].reduce(function (pkg, fileName) {
		var fullFileName = getFullFileName(fileName);

		if (!pkg && fs.existsSync(fullFileName)) {
			pkg = new PackageFile(fullFileName);
		}

		return pkg;
	}, null);
}

function getProperty(name) {
	var propertyValue = undefined;

	if (isCIEnv()) {
		var props = propertiesParser(fs.readFileSync(process.env.TEAMCITY_BUILD_PROPERTIES_FILE, 'utf8'));

		propertyValue = props[name];
	}

	if (typeof propertyValue === 'undefined') {
		console.log('[WARN]: Property ' + name + ' not defined');
		console.log('[INFO]: Running ' + (isCIEnv() ? '' : 'NOT ') + 'under TeamCity');
	}
}

function isRelease() {
	return !!getProperty('release.type');
}

function setSnapshotBuildNumber() {
	var pkg = getMainPackageFile();

	pkg.bumpVersion('minor');
	setBuildNumber('' + pkg.getVersion() + '-snapshot{build.number}');
}

function setReleaseBuildNumber() {
	var pkg = getMainPackageFile();

	setBuildNumber('' + pkg.getVersion());
}

function setBuildNumber(buildNumber) {
	console.log('##teamcity[buildNumber \'' + buildNumber + '\']');
}

module.exports = {
	isCIEnv: isCIEnv,
	getProperty: getProperty,
	setSnapshotBuildNumber: setSnapshotBuildNumber,
	setReleaseBuildNumber: setReleaseBuildNumber
};