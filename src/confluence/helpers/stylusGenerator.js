let fs = require('fs');
let path = require('path');
let cheerio = require('cheerio');
let Promise = require('promise');
let colors = require('colors');

module.exports = {
	write: generateStylusFile
};


function createFolders(relativePath) {
	let folders = relativePath.split('/').slice(1),
		fileName = folders.pop(),
		folderPath = process.cwd();

	folders.forEach(folderName => {
		folderPath = path.join(folderPath, folderName);
		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath);
		}
	});

	return path.join(folderPath, fileName)
}

function writeToFile(text, relativePath) {

	let absolutePath = createFolders(relativePath);

	return new Promise((resolve, reject) => {
		fs.writeFile(absolutePath, text, err => {
			if (err) {
				reject(err);
			}
			resolve();
			console.log(`The file ${relativePath} was saved!`.magenta);
		});
	});
}

function parseTable(string) {
	let $ = cheerio.load(string),
		map = {};

	$('tbody tr').each((t, elem) => {

		let colorIndex = $('td:first-child', elem).html(),
			names = $('td:last-child span ', elem).html() || '',
			color = '' + $('td:first-child + td + td', elem).attr('style');

		names = names.replace(new RegExp('<(/)*span>', 'g'), '').replace(/&#xA0;/g, '').split(',');
		color = color.slice(('background-color: ').length, color.length - 1);

		names
			.filter(name => name)
			.forEach(name => {
				name = name.toLowerCase().trim();
				map[name] = color;
			});


	});

	return map;
}

function wrapHash(hashName, hashData) {
	let result = '';
	if (hashName) {
		hashData = hashData.slice(0, hashData.length - 2) + '\n';
		result += `$${hashName} = { \n`;
		result += hashData;
		result += '};\n';
	} else {
		result = hashData;
	}
	return result;
}

function composeLine(varName, varValue, isInHash) {
	if (isInHash) {
		return `\t${varName}: ${varValue},\n`;
	}
	return `$${varName} = ${varValue};\n`;

}

function createPageVariables(string, name) {
	let map = parseTable(string),
		result = '';

	Object
		.keys(map)
		.forEach(key => {result += composeLine(key, map[key], !!name)});

	return wrapHash(name, result);
}

function generateStylusFile(dataArray, destination) {
	let result = '';

	dataArray.forEach(page => {result += createPageVariables(page.data, page.name)});

	return writeToFile(result, destination);
}