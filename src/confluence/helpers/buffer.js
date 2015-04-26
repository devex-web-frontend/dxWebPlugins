var https = require('https');
var conf =  require('../../../conf.json');
var prompt = require('prompt');
var Promise = require('promise');

module.exports = {
    write: setPageContent,
    read : getPageContent
};

function getAuthInfo() {
    var properties = [
        {
            name: 'username',
            warning: 'Username must be only letters, spaces, or dashes'
        },
        {
            name: 'password',
            hidden: true
        }
    ];
    prompt.start();

    var promise = new Promise(function(resolve, reject) {
        if (!conf || !conf.pass || !conf.user) {
            prompt.get(properties, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    conf = {};
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
function createRequest(path ,method) {
    var promise = new Promise(function(resolve, reject) {
        getAuthInfo().then(function(data) {

            var conf = data;

            var auth = new Buffer(conf.user + ':' + conf.pass).toString('base64');
            resolve( {
                host: 'confluence.in.devexperts.com',
                port: 443,
                contentType: "application/json; charset=utf-8",
                'path': path,
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

function get(request, resolve, reject){

    https.get(request, function(res) {
        var respond = '';
        if (res.statusCode === 401) {
            reject(res.statusCode);
            return;
        }
        res.on('data', function(chunk) {
            respond += chunk;
        });
        res.on('end', function() {
            var result = JSON.parse(respond);
            resolve(result);
        });
    }).on('error', function(err) {
        reject(err);
    });
}

function set(request, data, resolve, reject) {
    var R = https.request(request, function (res) {
        var respond = '';

        res.on('data', function (chunk) {
            respond += chunk;
        });
        res.on('end', function () {
            var result = JSON.parse(respond);
            if (!!result.statusCode) {
                reject(result.statusCode + ': ' +result.message);
                return;
            }
            resolve(result);
        });
    });
    R.on('error', function(err) {
        reject(err)
    });
    R.write(data);
    R.end();

}

function getPageContent(pageId) {
    var path = '/rest/api/content/' + pageId + '?expand=body.view,version';
    return new Promise(function(resolve, reject) {
        createRequest(path).then(function(request) {
           get(request, resolve, reject);
        });

    });
}

function setPageContent(pageId, newContent) {
    var path = '/rest/api/content/' + pageId,
        data = {
            "id": pageId,
            "body": {
                "storage": {
                    "value": newContent || "<p>This is a new page</p>",
                    "representation": "storage"
                }
            }
        };

    return new Promise(function(resolve, reject){
        getPageContent(pageId).then(function(respond) {
            data.version = {number: respond.version.number + 1};
            data.type = respond.type;
            data.title = respond.title;
            data = JSON.stringify(data);

            createRequest(path, 'PUT').then(function (request) {
                request.headers['Content-Length'] = data.length;
                set(request, data, resolve, reject);
            }, reject);

        }, reject);
    });

}


