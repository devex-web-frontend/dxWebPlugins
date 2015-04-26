const PROJECT_ROOT = process.cwd();
const BOWER_CFG = 'bower.json';
const PACKAGE_CFG = 'package.json';

let fs = require('fs');
let path = require('path');
let	propertiesParser = require('properties').parse;

let PackageFile = require('./release/PackageFile.class.js');



function isCIEnv() {
	return !!process.env.TEAMCITY_VERSION;
}

function getFullFileName(fileName) {
	return path.join(PROJECT_ROOT, fileName);
}

function getMainPackageFile() {
	return [BOWER_CFG, PACKAGE_CFG].reduce((pkg, fileName) => {
		let fullFileName = getFullFileName(fileName);

		if (!pkg && fs.existsSync(fullFileName)) {
			pkg = new PackageFile(fullFileName);
		}

		return pkg;

	}, null)
}

function getProperty(name) {
	let propertyValue;

	if (isCIEnv()) {
		let props = propertiesParser(fs.readFileSync(process.env.TEAMCITY_BUILD_PROPERTIES_FILE, 'utf8'));

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
	let pkg = getMainPackageFile();

	pkg.bumpVersion('minor');
	setBuildNumber(`${pkg.getVersion()}-snapshot{build.number}`);
}

function setReleaseBuildNumber() {
	let pkg = getMainPackageFile();

	setBuildNumber(`${pkg.getVersion()}`);
}

function setBuildNumber(buildNumber) {
	console.log(`##teamcity[buildNumber '${buildNumber}']`);
}

module.exports = {
	isCIEnv,
	getProperty,
	setSnapshotBuildNumber,
	setReleaseBuildNumber
};