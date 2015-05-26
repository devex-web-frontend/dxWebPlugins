'use strict';

var https = require('https');
var Promise = require('promise');
var fs = require('fs');
var path = require('path');
var auth = require('./auth.js');

module.exports = {
	write: setPageContent,
	read: getPageContent
};

/**
 * Returns promise for getting request properties
 * @param {String} path
 * @param {String} [method='GET']
 * @return {Promise.<Object>}
 */

function createRequest(path) {
	var method = arguments[1] === undefined ? 'GET' : arguments[1];

	var promise = new Promise(function (resolve) {
		auth.getCredinals().then(function (conf) {
			var auth = new Buffer(conf.user + ':' + conf.pass).toString('base64');
			resolve({
				host: 'confluence.in.devexperts.com',
				port: 443,
				contentType: 'application/json; charset=utf-8',
				path: path,
				method: method,
				headers: {
					Authorization: 'Basic ' + auth,
					'Content-Type': 'application/json'
				},
				rejectUnauthorized: false,
				requestCert: true,
				agent: false
			});
		});
	});
	return promise;
}

/**
 * Handles https respond, then calling resolve or reject methods
 * @param {Object} res
 * @param {Function} resolve
 * @param {Function} reject
 */
function respondHandler(res, resolve, reject) {
	var respond = '';

	res.on('data', function (chunk) {
		respond += chunk;
	});
	res.on('end', function () {
		var result = JSON.parse(respond);
		if (!!result.statusCode) {
			reject('' + result.statusCode + ' : ' + result.message);
		}
		resolve(result);
	});
}

/**
 * Returns promise for getting https GET-request data
 * @param {String} request
 * @return {Promise.<String>}
 */
function get(request) {

	return new Promise(function (resolve, reject) {
		https.get(request, function (res) {
			respondHandler(res, resolve, reject);
		}).on('error', reject);
	});
}
/**
 * Returns promise for sending https POST-request
 * @param {String} request
 * @param {Object} data
 * @return {Promise.<String>}
 */
function set(request, data) {
	return new Promise(function (resolve, reject) {
		var R = https.request(request, function (res) {
			respondHandler(res, resolve, reject);
		});
		R.on('error', reject);
		R.write(data);
		R.end();
	});
}

/**
 * Returns data object for https POST request
 * @param {String} pageId
 * @param {String} newContent
 * @param {Object} currentPage
 * @return {JSON}
 */
function composeData(pageId, newContent, currentPage) {
	var data = {
		id: pageId,
		type: currentPage.type,
		title: currentPage.title,
		version: {
			number: currentPage.version.number + 1
		},
		body: {
			storage: {
				value: newContent || '<p>This is a new page</p>',
				representation: 'storage'
			}
		}
	};

	return JSON.stringify(data);
}
/**
 * Returns promise for getting confluence page content
 * @param {String} pageId
 * @return {Promise.<String>}
 */
function getPageContent(pageId) {
	var path = '/rest/api/content/' + pageId + '?expand=body.view,version';
	return createRequest(path).then(get);
}

/**
 * Returns promise for setting confluence page content
 * @param {String} pageId
 * @param {String} newContent
 * @return {Promise.<String>}
 */
function setPageContent(pageId, newContent) {
	var path = '/rest/api/content/' + pageId,
	    data = undefined;

	return getPageContent(pageId).then(function (respond) {
		data = composeData(pageId, newContent, respond);
		return createRequest(path, 'PUT');
	}).then(function (request) {
		request.headers['Content-Length'] = data.length;
		return set(request, data);
	});
}