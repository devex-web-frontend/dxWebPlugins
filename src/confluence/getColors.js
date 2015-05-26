let buffer = require('./helpers/buffer.js');
let styl = require('./helpers/stylusGenerator.js');
let Promise = require('promise');
let colors = require('colors');

module.exports = {
	readToFile: readToFile,
	readToMultipleFiles: readToMultipleFiles
};

function errorHandler(err) {
	console.error(`Error reading: ${err}`.red);
}
/**
 * Returns promise for reading page from confluence
 * @param {Object.<{id:string|number, pageName: ?string}>} page data
 * @return {Promise.<{name: String, data: String}>}
 */
function readPage(page) {
	let pageId,
		pageName;

	if (typeof page === 'number' || typeof page === 'string') {
		pageId = page;
	} else {
		pageId = page.id;
		pageName = page.name;
	}
	return new Promise((resolve, reject) => {
		buffer.read(pageId)
			.then(respond => {
				console.log(`Succsessfully read ${pageId}`.green);
				resolve({
					name: pageName,
					data: respond.body.view.value
				});
			})
			.catch(reject);
	});
}

/**
 * Returns promise for reading pages from confluence and writing its parsed data into one file
 * @param {Array.<Object.<{id:string|number, pageName: ?string}>>} pages
 * @param {String} [destination="test.styl"] destination file
 * @return {Promise.<String>}
 */
function readToFile(pages, destination = 'test.styl') {
	let promises = pages.map((page) => readPage(page));

	return Promise
		.all(promises)
		.then(result => {
			return styl.write(result, destination);
		})
		.catch(err => {
			errorHandler(err);
			return Promise.reject(err);
		})
}
/**
 * Returns promise for reading pages from confluence and writing its parsed data into multiple files
 * @param {Array.<Object.<{pages:array.<string|object|number>, destination:string}>>} configArray
 * @return {Promise.<String>}
 */
function readToMultipleFiles(configArray) {

	let promises = configArray.map(config => readToFile(config.pages, config.destination));

	return Promise.all(promises);

}
