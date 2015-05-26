let https = require('https');
let Promise = require('promise');
let fs = require('fs');
let path = require('path');
let auth = require('./auth.js');

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

function createRequest(path, method = 'GET') {
	let promise = new Promise(resolve => {
		auth.getCredinals()
			.then(conf => {
				let auth = new Buffer(conf.user + ':' + conf.pass).toString('base64');
				resolve({
					host: 'confluence.in.devexperts.com',
					port: 443,
					contentType: "application/json; charset=utf-8",
					path: path,
					method: method,
					headers: {
						'Authorization': `Basic ${auth}`,
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
	let respond = '';

	res.on('data', chunk => {
		respond += chunk;
	});
	res.on('end', () => {
		let result = JSON.parse(respond);
		if (!!result.statusCode) {
			reject(`${result.statusCode} : ${result.message}`);
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

	return new Promise((resolve, reject) => {
		https.get(request, res => {
			respondHandler(res, resolve, reject);
		})
			.on('error', reject);
	});
}
/**
 * Returns promise for sending https POST-request
 * @param {String} request
 * @param {Object} data
 * @return {Promise.<String>}
 */
function set(request, data) {
	return new Promise((resolve, reject) => {
		let R = https.request(request, res => {
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
	let data = {
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
	let path = `/rest/api/content/${pageId}?expand=body.view,version`;
	return createRequest(path).then(get);
}

/**
 * Returns promise for setting confluence page content
 * @param {String} pageId
 * @param {String} newContent
 * @return {Promise.<String>}
 */
function setPageContent(pageId, newContent) {
	let path = `/rest/api/content/${pageId}`,
		data;

	return getPageContent(pageId)
		.then(respond => {
			data = composeData(pageId, newContent, respond);
			return createRequest(path, 'PUT');
		})
		.then(request => {
			request.headers['Content-Length'] = data.length;
			return set(request, data)
		});
}


