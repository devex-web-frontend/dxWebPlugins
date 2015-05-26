let fs = require('fs');
let path = require('path');
let cheerio = require('cheerio');
let Promise = require('promise');
let colors = require('colors');

module.exports = {
	write: generateStylusFile
};
/**
 * Sanitizes file path to start with /
 * @param {String} path
 * @return {String}
 */
function sanitizePath(path) {
	if (path.charAt(0) !== '/') {
		path = '/' + path;
	}
	return path;
}
/**
 * Creates folders for filePath and returns relative to process path to file
 * @param {String} relativePath – path to file
 * @return {String}
 */
function createFolders(relativePath) {

	let folders = sanitizePath(relativePath).split('/').slice(1),
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
/**
 * Returns promise for writing to file
 * @param {String} text – text to write
 * @param {String} relativePath – path to file
 * @return {Promise.<String>}
 */
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
/**
 * Parses HTML table into map of variables and its values
 * @param {String} string – HTML node
 * @return {Object.<String, string>}
 */
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
/**
 * Returns hash
 * @param {String} hashName
 * @param {String} hashData – which is needed to be wrapped
 * @return {String}
 */
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
/**
 * Returns composed line for styl file
 * @param {String} varName
 * @param {String} varValue
 * @param {Boolean} [isInHash=false] – does variable belong to hash
 * @return {String}
 */

function composeLine(varName, varValue, isInHash = false) {
	if (isInHash) {
		return `\t${varName}: ${varValue},\n`;
	}
	return `$${varName} = ${varValue};\n`;

}
/**
 * Returns part of .styl file with all variables from HTML
 * @param {String} string – HTML
 * @param {String=} name – hash name
 * @return {String}
 */
function createPageVariables(string, name) {
	let map = parseTable(string),
		result = '';

	Object
		.keys(map)
		.forEach(key => {
			result += composeLine(key, map[key], !!name)
		});

	return wrapHash(name, result);
}
/**
 * Returns promise for writing from confluence to .styl file
 * @param {Array.<Object.<{data:String, name:String}>>} dataArray
 * @param {String} destination – file path
 * @return {Promise.<String>}
 */
function generateStylusFile(dataArray, destination) {
	let result = '';

	dataArray.forEach(page => {
		result += createPageVariables(page.data, page.name)
	});

	return writeToFile(result, destination);
}