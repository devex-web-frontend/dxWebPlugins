'use strict';

var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var Promise = require('promise');
var colors = require('colors');

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

	var folders = sanitizePath(relativePath).split('/').slice(1),
	    fileName = folders.pop(),
	    folderPath = process.cwd();

	folders.forEach(function (folderName) {
		folderPath = path.join(folderPath, folderName);
		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath);
		}
	});

	return path.join(folderPath, fileName);
}
/**
 * Returns promise for writing to file
 * @param {String} text – text to write
 * @param {String} relativePath – path to file
 * @return {Promise.<String>}
 */
function writeToFile(text, relativePath) {

	var absolutePath = createFolders(relativePath);

	return new Promise(function (resolve, reject) {
		fs.writeFile(absolutePath, text, function (err) {
			if (err) {
				reject(err);
			}
			resolve();
			console.log(('The file ' + relativePath + ' was saved!').magenta);
		});
	});
}
/**
 * Creates color value with opacity
 * @param {String} color – color in rgb() or HEX format
 * @param {Number} opacity – opacity in percents
 * @param {Boolean} useHex is color in HEX format
 * @return {Object.<String, string>}
 */
function addOpacity(color, opacity, useHex) {
	var newColor = useHex ? color : color.slice(color.indexOf('(') + 1, color.length - 1);

	return 'rgba(' + newColor + ', ' + opacity / 100 + ')';
}
/**
 * Parses HTML table into map of variables and its values
 * @param {String} string – HTML node
 * @return {Object.<String, string>}
 */
function parseTable(string, useHex) {
	var $ = cheerio.load(string),
	    map = {};

	$('tbody tr').each(function (t, elem) {
		if ($(elem).children('td').length > 1) {
			(function () {
				var colorIndex = $('td:first-child', elem).html(),
				    names = $('td:last-child', elem).text() || '',
				    hexColor = $('td:first-child + td', elem).text() || '',
				    rgbColor = $('td:first-child + td + td', elem).attr('style') || '',
				    color = useHex ? '#' + hexColor : '' + rgbColor.slice('background-color: '.length, rgbColor.length - 1);

				names = names.replace(new RegExp('<(/)*span>', 'g'), '').replace(/&#xA0;/g, '').split(',');

				names.forEach(function (name) {
					var opacity = name.match(/(\d+)\%/);
					var processedColor = color;
					if (!!opacity) {
						name = name.slice(0, opacity.index - 1);
						processedColor = addOpacity(color, parseInt(opacity[1]), useHex);
					}
					name = name.replace(/ /g, '').toLowerCase().trim();
					map[name] = processedColor;
				});
			})();
		}
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
	var result = '';
	if (hashName) {
		hashData = hashData.slice(0, hashData.length - 2) + '\n';
		result += '$' + hashName + ' = { \n';
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

function composeLine(varName, varValue) {
	var isInHash = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

	if (isInHash) {
		return '\t' + varName + ': ' + varValue + ',\n';
	}
	return '$' + varName + ' = ' + varValue + ';\n';
}
/**
 * Returns part of .styl file with all variables from HTML
 * @param {String} string – HTML
 * @param {String=} name – hash name
 * @return {String}
 */
function createPageVariables(string, name, useHex) {
	var map = parseTable(string, useHex),
	    result = '';

	Object.keys(map).forEach(function (key) {
		result += composeLine(key, map[key], !!name);
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
	var result = '';

	dataArray.forEach(function (page) {
		result += createPageVariables(page.data, page.name, page.useHex);
	});

	return writeToFile(result, destination);
}