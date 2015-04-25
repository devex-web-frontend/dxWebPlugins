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
        headers: {
            Authorization: 'Basic ' + auth
        },
        rejectUnauthorized: false,
        requestCert: true,
        agent: false
    };
}

function getPageContent(pageId, resolve, reject) {
    var path = '/rest/api/content/' + pageId + '?expand=body.view';
    https.get(createRequest(path), function (res) {
        var respond = '';
        res.on('data', function (chunk) {
            respond += chunk;
        });
        res.on('end', function () {
            var result = JSON.parse(respond);
            console.log(result.body.view);
        });
    });
}

getPageContent(108139543);