const PROJECT_ROOT = process.cwd();
const BOWER_CFG = 'bower.json';
const PACKAGE_CFG = 'package.json';

let SVNHelpers = new (require('./release/SVNRepo.js'))(PROJECT_ROOT);
let PackageFile = require('./release/PackageFile.class.js');
let fs = require('fs');
let path = require('path');
let propertiesParser = require('properties').parse;
let vcs = require('./release/vcs.js');

function getProjectPackageFiles() {
	return [PACKAGE_CFG, BOWER_CFG].reduce((result, fileName) => {
		let fullFileName = getFullFileName(fileName);

		if (fs.existsSync(fullFileName)) {
			result[fileName] = new PackageFile(fullFileName);
		}
		return result;
	}, {})
}

function getFullFileName(fileName) {
	return path.join(PROJECT_ROOT, fileName);
}

function releasePackageFiles(releaseType) {
	PACKAGE_FILES.forEach(fileName => {
		let fullFileName = getFullFileName(fileName);

		if (fs.existsSync(fullFileName)) {
			updateFile(fullFileName, releaseType);
		}
	})
}

function isCiRun() {
	return !!process.env.TEAMCITY_VERSION;
}

function getProperty(name) {
	var file,
		propsJSON,
		result;

	if (isCiRun()) {
		file = fs.readFileSync(process.env.TEAMCITY_BUILD_PROPERTIES_FILE, 'utf-8');
		propsJSON = propertiesParser(file);

		result = propsJSON[name]
	}

	if (typeof result === 'undefined') {
		console.log('[WARN]: Property ' + name + ' not defined');
		console.log('[INFO]: Running ' + (isCiRun() ? '' : 'NOT ') + 'under TeamCity');
	}

	return result;
}

function processPackageFiles(packageFiles, releaseType) {
	Object.keys(packageFiles).forEach((fileName) => {
		let pkg = packageFiles[fileName];

		pkg.bumpVersion(releaseType);
		pkg.save();
	});
}

module.exports = {

	performRelease(releaseType) {
		let packageFiles = getProjectPackageFiles();
		let pkg = packageFiles[BOWER_CFG] || packageFiles[PACKAGE_CFG];

		processPackageFiles(packageFiles, releaseType);

		return vcs.init()
			.then(() => vcs.push(Object.keys(packageFiles), `[release ${pkg.getVersion()}]`))
			.then(() => vcs.createTag(pkg.getVersion()))
			.then(function() {console.log(arguments)})
			.catch(function() {console.log('fail', arguments)});
	},
	setTeamcityVersion() {
	//	//let version = releaseVersion || JSON.parse(fs.readFileSync(getFullFileName('package.json'), 'utf8')).version;
	//
	//	let isRelease = !!getProperty('release.type');
	//
	//	let message = [
	//			"##teamcity[buildNumber '",
	//				version + (isRelease ? "" : "{build.number}"),
	//			"']"
	//		];
	//
	//	console.log(message.join(''));
	}

};