'use strict';

var https = require('https');
var conf = require('../../conf.json') || {};
var prompt = require('prompt');

var Promise = require('promise');

module.exports = {
    write: setPageContent,
    read: getPageContent
};

function getAuthInfo() {
    prompt.start();

    var promise = new Promise(function (resolve, reject) {
        if (!conf) {
            prompt.get(['username', 'password'], function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    conf.user = res.username;
                    conf.pass = res.password;
                    resolve(conf);
                }
            });
        } else {
            resolve(conf);
        }
    });
    return promise;
}
function createRequest(path, method) {
    var promise = new Promise(function (resolve, reject) {
        getAuthInfo().then(function (data) {

            var conf = data;

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

function getPageContent(pageId, callback) {
    var path = '/rest/api/content/' + pageId + '?expand=body.view,version';
    createRequest(path).then(function (request) {
        https.get(request, function (res) {
            var respond = '';
            res.on('data', function (chunk) {
                respond += chunk;
            });
            res.on('end', function () {
                var result = JSON.parse(respond);
                callback(result);
            });
        });
    });
}

function setPageContent(pageId, newContent) {
    var path = '/rest/api/content/' + pageId,
        data = {
        id: pageId,
        type: 'page',
        version: { number: 14 },
        title: '333',
        body: {
            storage: {
                value: newContent || '<p>This is a new page</p>',
                representation: 'storage'
            }
        }
    };

    createRequest(path, 'PUT').then(function (request) {
        data = JSON.stringify(data);
        request.headers['Content-Length'] = data.length;
        var R = https.request(request, function (res) {
            var respond = '';
            res.on('data', function (chunk) {
                respond += chunk;
            });
            res.on('end', function () {
                var result = JSON.parse(respond);
                console.log(result);
            });
        });
        R.write(data);
        R.end();
    });
}