let glob = require("glob");
let fs = require('fs');
let path = require('path');
let sanitizeHtml = require('sanitize-html');
let Promise = require('promise');
let colors = require('colors');


let buffer = require('./helpers/buffer.js');

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
	let startIndex = data.indexOf('<body>') ? data.indexOf('<body>') + ('<body>').length : 0,
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
		exclusiveFilter: frame => (frame.attribs.class === "tag-source")
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
		let filePath = path.join(process.cwd(), file);
		let buf = fs.readFileSync(filePath).toString();
		let result = prepareData(buf);

		return writeToConfluence(pageId, result);
	} else {
		return Promise.reject(`No such file (${file}) in config`);
	}
}
/**
 * Returns promise for publishing string data to confluence pages
 * @param {String|Number} pageId
 * @param {String} data
 * @return {Promise.<String>}
 */
function writeToConfluence(pageId, data) {
	return buffer.write(pageId, data)
		.then(respond => {
			let href = composeLink(respond);
			console.log(`Succesffuly written to page ${pageId} (${href})`.green);
		})
		.catch(err => Promise.reject(err))
}
/**
 * Returns promise for publishing data from html files to confluence pages
 * @param {Object.<String, String|Number>} pages – map with module name as key and page id as value
 * @param {String} [sourceFolder='test/out/api'] –folder containing files
 * @return {Promise.<String>}
 */
function publishAll(pages, sourceFolder = 'test/out/api') {

	process.chdir(sourceFolder);

	let promises = Object
		.keys(pages)
		.map(moduleName =>
			processFile(`${moduleName}.html`, pages[moduleName])
	);

	return Promise.all(promises)
		.catch(err => {
			console.log(`Error writing: ${err}`.red);
			return Promise.reject(err);
		});
}