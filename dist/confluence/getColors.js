'use strict';

var buffer = require('./helpers/buffer.js');
var styl = require('./helpers/stylusGenerator.js');
var Promise = require('promise');
var colors = require('colors');

module.exports = {
	readToFile: readToFile,
	readToMultipleFiles: readToMultipleFiles
};

function errorHandler(err) {
	console.error(('Error reading: ' + err).red);
}
function readPage(page) {
	var pageId = undefined,
	    pageName = undefined;
	if (typeof page === 'number' || typeof page === 'string') {
		pageId = page;
	} else {
		pageId = page.id;
		pageName = page.name;
	}
	return new Promise(function (resolve, reject) {
		buffer.read(pageId).then(function (respond) {
			console.log(('Succsessfully read ' + pageId).green);
			resolve({
				name: pageName,
				data: respond.body.view.value
			});
		})['catch'](reject);
	});
}

function readToFile(pages) {
	var destination = arguments[1] === undefined ? 'test.styl' : arguments[1];

	var promises = pages.map(function (page) {
		return readPage(page);
	});

	return Promise.all(promises).then(function (result) {
		return styl.write(result, destination);
	})['catch'](function (err) {
		errorHandler(err);
		return Promise.reject(err);
	});
}

function readToMultipleFiles(configArray) {

	var promises = configArray.map(function (config) {
		return readToFile(config.pages, config.destination);
	});

	return Promise.all(promises);
}