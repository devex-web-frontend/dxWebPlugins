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

function createRequest(path, method) {
    var promise = new Promise(function (resolve) {
        auth.getCredinals().then(function (conf) {
            var auth = new Buffer(conf.user + ':' + conf.pass).toString('base64');
            resolve({
                host: 'confluence.in.devexperts.com',
                port: 443,
                contentType: 'application/json; charset=utf-8',
                path: path,
                method: method || 'GET',
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

function get(request) {

    return new Promise(function (resolve, reject) {
        https.get(request, function (res) {
            respondHandler(res, resolve, reject);
        }).on('error', function (err) {
            reject(err);
        });
    });
}

function set(request, data) {
    return new Promise(function (resolve, reject) {
        var R = https.request(request, function (res) {
            respondHandler(res, resolve, reject);
        });
        R.on('error', function (err) {
            reject(err);
        });
        R.write(data);
        R.end();
    });
}

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

function getPageContent(pageId) {
    var path = '/rest/api/content/' + pageId + '?expand=body.view,version';
    return createRequest(path).then(get);
}

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