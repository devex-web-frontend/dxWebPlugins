var https = require('https');
var conf = require('../../conf.json');

var auth = new Buffer(conf.user + ':' + conf.pass).toString('base64');
var options = {
    host: 'confluence.in.devexperts.com',
    port: 443,
    contentType:"application/json; charset=utf-8",
    'path': '/rest/api/content/33364165',
    headers: {
        'Authorization': 'Basic ' + auth

    },
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
};

https.get(options, function(res) {
    console.log(arguments)
});