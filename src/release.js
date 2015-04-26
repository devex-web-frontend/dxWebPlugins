const PROJECT_ROOT = process.cwd();
const BOWER_CFG = 'bower.json';
const PACKAGE_CFG = 'package.json';

let PackageFile = require('./release/PackageFile.class.js');
let fs = require('fs');
let path = require('path');
let vcs = require('./release/vcs.js');
let teamcity = require('./teamcity.js');

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
		let version;

		processPackageFiles(packageFiles, releaseType);

		version = (packageFiles[BOWER_CFG] || packageFiles[PACKAGE_CFG]).getVersion();
		return vcs.init()
			.then(() => vcs.push(Object.keys(packageFiles), `[release ${version}]`))
			.then(() => vcs.createTag(version))
			.then(() => {
				teamcity.setReleaseBuildNumber();
				console.log(`version ${version} released`);
			});
	}
};