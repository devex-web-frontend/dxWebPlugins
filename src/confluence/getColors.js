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

function readToMultipleFiles(configArray) {

	let promises = configArray.map(config => readToFile(config.pages, config.destination));

	return Promise.all(promises);

}
