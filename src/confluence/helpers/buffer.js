let https = require('https');
let Promise = require('promise');
let fs = require('fs');
let path = require('path');
let auth = require('./auth.js');

module.exports = {
    write: setPageContent,
    read : getPageContent
};

function createRequest(path, method) {
    let promise = new Promise(function(resolve) {
        auth.getCredinals()
            .then(function(conf) {
                let auth = new Buffer(conf.user + ':' + conf.pass).toString('base64');
                resolve({
                    host: 'confluence.in.devexperts.com',
                    port: 443,
                    contentType: "application/json; charset=utf-8",
                    path: path,
                    method: method || "GET",
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

function respondHandler(res, resolve, reject) {
    let respond = '';

    res.on('data', function(chunk) {
        respond += chunk;
    });
    res.on('end', function() {
        let result = JSON.parse(respond);
        if (!!result.statusCode) {
            reject(result.statusCode + ': ' +result.message);
        }
        resolve(result);
    });
}

function get(request){

    return new Promise(function(resolve, reject) {
        https.get(request, function(res) {
                respondHandler(res, resolve, reject);
            })
            .on('error', function(err) {
                reject(err);
            });
    });
}

function set(request, data) {
    return new Promise(function(resolve, reject) {
        let R = https.request(request, function (res) {
            respondHandler(res, resolve, reject);
        });
        R.on('error', function(err) {
            reject(err)
        });
        R.write(data);
        R.end();
    });

}


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

function getPageContent(pageId) {
    let path = `/rest/api/content/${pageId}?expand=body.view,version`;
    return createRequest(path).then(get);
}

function setPageContent(pageId, newContent) {
    let path = `/rest/api/content/${pageId}`,
        data;

    return getPageContent(pageId)
            .then(function (respond) {
                data = composeData(pageId, newContent, respond);
                return createRequest(path, 'PUT');
            })
            .then(function (request) {
                request.headers['Content-Length'] = data.length;
                return set(request, data)
            });
}


