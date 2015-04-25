'use strict';

var https = require('https');
var conf = require('../../conf.json');

function createRequest(path, method) {
    var auth = new Buffer(conf.user + ':' + conf.pass).toString('base64');
    return {
        host: 'confluence.in.devexperts.com',
        port: 443,
        contentType: 'application/json; charset=utf-8',
        path: path,
        method: method || 'GET',
        headers: {
            Authorization: 'Basic ' + auth
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
            var body = result.body.view;
            version = result.version.number;
            console.log(result);
        });
    });
}

function setPageContent(pageId) {
    var path = '/rest/api/content/' + pageId,
        req = createRequest(path, 'PUT'),
        data = {
        id: pageId,
        type: 'page',
        version: { number: 3 },
        title: 'test',
        body: {
            view: {
                value: '<p>This is a new page</p>'
            }
        }
    };
    data = JSON.stringify(data);
    console.log(data);
    req.headers['Content-Type'] = 'application/json';
    req.headers['Content-Length'] = data.length;
    var R = https.request(req, function (res) {
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
}

//getPageContent(108139543);
setPageContent(108139543);