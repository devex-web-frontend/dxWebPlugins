var https = require('https');
var Promise = require('promise');
var fs = require('fs');
var path = require('path');
var auth = require('./auth.js');

module.exports = {
    write: setPageContent,
    read : getPageContent
};

function createRequest(path, method) {
    var promise = new Promise(function(resolve, reject) {
        auth.getCredinals()
            .then(function(conf) {
                var auth = new Buffer(conf.user + ':' + conf.pass).toString('base64');
                resolve({
                    host: 'confluence.in.devexperts.com',
                    port: 443,
                    contentType: "application/json; charset=utf-8",
                    path: path,
                    method: method || "GET",
                    headers: {
                        'Authorization': 'Basic ' + auth,
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

function get(request){

    return new Promise(function(resolve, reject){
        https
            .get(request, function(res) {
                var respond = '';
                if (res.statusCode === 401 || res.statusCode === 404) {
                    reject(res.statusCode);
                }
                res.on('data', function(chunk) {
                    respond += chunk;
                });
                res.on('end', function() {
                    var result = JSON.parse(respond);
                    resolve(result);
                });
            })
            .on('error', function(err) {
                reject(err);
            });
    });
}

function set(request, data) {
    return new Promise(function(resolve, reject) {
        var R = https.request(request, function (res) {
            var respond = '';

            res.on('data', function (chunk) {
                respond += chunk;
            });
            res.on('end', function () {
                var result = JSON.parse(respond);
                if (!!result.statusCode) {
                    reject(result.statusCode + ': ' +result.message);
                }
                resolve(result);

            });
        });
        R.on('error', function(err) {
            reject(err)
        });
        R.write(data);
        R.end();
    });

}

function getPageContent(pageId) {
    var path = '/rest/api/content/' + pageId + '?expand=body.view,version';
    return createRequest(path).then(get);
}

function composeData(pageId, newContent, respond) {
    var data = {
        "id": pageId,
        "body": {
            "storage": {
                "value": newContent || "<p>This is a new page</p>",
                "representation": "storage"
            }
        }
    };
    data.version = {number: respond.version.number + 1};
    data.type = respond.type;
    data.title = respond.title;
    data = JSON.stringify(data);
    return data;
}

function setPageContent(pageId, newContent) {
    var path = '/rest/api/content/' + pageId,
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


