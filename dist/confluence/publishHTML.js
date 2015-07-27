'use strict';

var glob = require('glob');
var fs = require('fs');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var Promise = require('promise');
var colors = require('colors');

var buffer = require('./helpers/buffer.js');

module.exports = {
	write: publishAll
};
/**
 * Composes http ling to confluence page from https respond
 * @param {String} data
 * @return {String}
 */
function composeLink(respond) {
	return respond['_links'].base + respond['_links'].webui;
}
/**
 * Crops HTML between body and nav tags
 * @param {String} data
 * @return {String}
 */
function cropHTML(data) {
	var startIndex = data.indexOf('<body>') ? data.indexOf('<body>') + '<body>'.length : 0,
	    endIndex = data.indexOf('<nav>') ? data.indexOf('<nav>') : null;

	return data.slice(startIndex, endIndex);
}

/**
 * Sanitizes HTML for publishing on confluence
 * @param {String} data
 * @return {String}
 */
function prepareData(data) {

	data = cropHTML(data);
	return sanitizeHtml(data, {
		transformTags: {
			'dd': sanitizeHtml.simpleTransform('div'),
			'dt': sanitizeHtml.simpleTransform('h5'),
			'dl': sanitizeHtml.simpleTransform('div')
		},
		exclusiveFilter: function exclusiveFilter(frame) {
			return frame.attribs['class'] === 'tag-source';
		}
	});
}

/**
 * Returns promise for publishing data from file to confluence pages
 * @param {String} file – path to file
 * @param {String|Number} pageId
 * @return {Promise.<String>}
 */
function processFile(file, pageId) {

	if (path.existsSync(file)) {
		var filePath = path.join(process.cwd(), file);
		var buf = fs.readFileSync(filePath).toString();
		var result = prepareData(buf);

		return writeToConfluence(pageId, result);
	} else {
		return Promise.reject('No such file (' + file + ') in config');
	}
}
/**
 * Returns promise for publishing string data to confluence pages
 * @param {String|Number} pageId
 * @param {String} data
 * @return {Promise.<String>}
 */
function writeToConfluence(pageId, data) {
	return buffer.write(pageId, data).then(function (respond) {
		var href = composeLink(respond);
		console.log(('Succesffuly written to page ' + pageId + ' (' + href + ')').green);
	})['catch'](function (err) {
		return Promise.reject(err);
	});
}
/**
 * Returns promise for publishing data from html files to confluence pages
 * @param {Object.<String, String|Number>} pages – map with module name as key and page id as value
 * @param {String} [sourceFolder='test/out/api'] –folder containing files
 * @return {Promise.<String>}
 */
function publishAll(pages) {
	var sourceFolder = arguments[1] === undefined ? 'test/out/api' : arguments[1];

	process.chdir(sourceFolder);

	var promises = Object.keys(pages).map(function (moduleName) {
		return processFile('' + moduleName + '.html', pages[moduleName]);
	});

	return Promise.all(promises)['catch'](function (err) {
		console.log(('Error writing: ' + err).red);
		return Promise.reject(err);
	});
}