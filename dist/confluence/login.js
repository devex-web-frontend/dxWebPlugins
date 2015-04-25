'use strict';

var https = require('https');
var conf = require('../../conf.json');

var styl = require('../confluence/stylus-gen.js');

function createRequest(path, method) {
    var auth = new Buffer(conf.user + ':' + conf.pass).toString('base64');
    return {
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
    };
}
var version;
function getPageContent(pageId, resolve, reject) {
    var path = '/rest/api/content/' + pageId + '?expand=body.view,version';
    https.get(createRequest(path), function (res) {
        var respond = '';
        res.on('data', function (chunk) {
            respond += chunk;
        });
        res.on('end', function () {
            var result = JSON.parse(respond);
            var body = result.body.view.value;
            styl.write(body);
        });
    });
}

function setPageContent(pageId) {
    var path = '/rest/api/content/' + pageId,
        req = createRequest(path, 'PUT'),
        data = {
        id: pageId,
        type: 'page',
        version: { number: 4 },
        title: '333',
        body: {
            storage: {
                value: '<p>This is a new page</p>',
                representation: 'storage'
            }
        }
    };
    data = JSON.stringify(data);
    req.headers['Content-Length'] = data.length;
    var R = https.request(req, function (res) {
        var respond = '';
        res.on('data', function (chunk) {
            respond += chunk;
        });
        res.on('end', function () {
            var result = JSON.parse(respond);
        });
    });
    R.write(data);
    R.end();
}

var darkScheme = 103777451;
getPageContent(darkScheme);
//setPageContent(108139548);