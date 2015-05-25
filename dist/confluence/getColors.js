'use strict';

var buffer = require('./helpers/buffer.js');
var styl = require('./helpers/stylusGenerator.js');
var Promise = require('promise');
var colors = require('colors');

module.exports = {
	read: read
};

function errorHandler(err) {
	console.error(('Error reading: ' + err).red);
}
function readPage(page) {
	var pageId = page.id,
	    pageName = page.name;

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

function read(pages) {
	var destination = arguments[1] === undefined ? 'test.styl' : arguments[1];

	var promises = pages.map(function (page) {
		return readPage(page);
	});

	return Promise.all(promises).then(function (result) {
		return styl.write(result, destination);
	})['catch'](function (err) {
		errorHandler(err);return Promise.reject(err);
	});
}