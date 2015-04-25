const PROJECT_ROOT = process.cwd();
const packageFiles = ['bower.json', 'package.json'];
const [PATCH, MINOR, MAJOR] = ['patch', 'minor', 'major'];
const versionPartIndexes = [MAJOR, MINOR, PATCH].reduce((prevValue, currentValue, index) => {
	prevValue[currentValue] = index;
	return prevValue;
}, {});

console.log('indexes', versionPartIndexes);

let SVNHelpers = new (require('./svn/svn.js'))(PROJECT_ROOT);
let fs = require('fs');
let path = require('path');

function bumpVersion(version, releaseType) {
	let affectedIndex = versionPartIndexes[releaseType];

	return version.split('.')
		.map((value, index) => {
			if (index === affectedIndex) {
				value = parseInt(value) + 1;
			}
			if (index > affectedIndex) {
				value = 0;
			}

			return value;
		}).join('.');
}

function updateFile(fullFileName, releaseType) {
	let fileData = JSON.parse(fs.readFileSync(fullFileName, 'utf8'));
	let currentVersion = fileData.version;
	fileData.version = bumpVersion(currentVersion, releaseType);

	fs.writeFileSync(fullFileName, JSON.stringify(fileData, null, 2));
}

function releasePackage(releaseType) {
	packageFiles.forEach(fileName => {
		let fullFileName = path.join(PROJECT_ROOT, fileName);

		if (fs.existsSync(fullFileName)) {
			updateFile(fullFileName, releaseType);
		}
	})
}

module.exports = {
	releaseTypes: {
		PATCH,
		MINOR,
		MAJOR
	},

	performRelease(releaseType) {
		releasePackage(releaseType);
	},

	test() {
		releasePackage(MAJOR);
	}
};