let fs = require('fs');

const {PATCH, MINOR, MAJOR} = require('./const.js').RELEASE_TYPES;
const versionPartIndexes = [MAJOR, MINOR, PATCH].reduce((prevValue, currentValue, index) => {
	prevValue[currentValue] = index;
	return prevValue;
}, {});


function readFile(fullFileName) {
	return JSON.parse(fs.readFileSync(fullFileName, 'utf8'));
}

function saveFile(fullFileName, data) {
	return fs.writeFileSync(fullFileName, JSON.stringify(data, null, 2));
}

module.exports = class PackageFile {
	constructor(fullFileName) {
		this.packageData = readFile(fullFileName);
		this.fullFileName = fullFileName;
	}

	getVersion() {
		return this.packageData.version;
	}

	bumpVersion(releaseType) {
		let affectedIndex = versionPartIndexes[releaseType];

		this.packageData.version = this.packageData.version
			.split('.')
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

	save() {
		saveFile(this.fullFileName, this.packageData)
	}
};