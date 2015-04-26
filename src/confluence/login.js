var https = require('https');
var conf = require('../../conf.json');
var styl = require('../confluence/stylus-gen.js');

var darkScheme = 103777451;
var chartScheme = 104825455;

module.exports = {
    write: setPageContent
}
function createRequest(path ,method){
    var auth = new Buffer(conf.user + ':' + conf.pass).toString('base64');
    return {
        host: 'confluence.in.devexperts.com',
        port: 443,
        contentType:"application/json; charset=utf-8",
        'path': path,
        method: method || "GET",
        headers: {
            'Authorization': 'Basic ' + auth,
            'Content-Type': 'application/json'
        },
        rejectUnauthorized: false,
        requestCert: true,
        agent: false
    };
}

function getPageContent(pageId, name) {
    var path = '/rest/api/content/' + pageId + '?expand=body.view,version';
        https.get(createRequest(path), function(res) {
            var respond = '';
            res.on('data', function(chunk) {
                respond += chunk;
            });
            res.on('end', function() {
                var result = JSON.parse(respond);
                var body = result.body.view.value;

                styl.write(body, name)
            });
    });

}

function setPageContent(pageId, newContent) {
    var path = '/rest/api/content/' + pageId,
        req = createRequest(path, 'PUT'),
        data = {
            "id": pageId,
            "type": "page",
            "version": {number: 13},
            "title": '333',
            "body":{
                "storage": {
                    "value": newContent || "<p>This is a new page</p>",
                    "representation":"storage"
                }
            }
        };
        data = JSON.stringify(data);
        req.headers['Content-Length'] = data.length;
    var R = https.request(req, function(res) {
        var respond = '';
        res.on('data', function(chunk) {
            respond += chunk;
        });
        res.on('end', function() {
            var result = JSON.parse(respond);
            console.log(result)
        });

    });
    R.write(data);
    R.end();
}


//getPageContent(darkScheme, 'darkScheme');
//getPageContent(chartScheme, 'chartScheme');
//setPageContent(108139548);