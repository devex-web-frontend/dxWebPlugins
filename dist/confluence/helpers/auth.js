'use strict';

var prompt = require('prompt');
var fs = require('fs');
var path = require('path');
var Promise = require('promise');

var absoluteCredinalsPath = path.join(process.cwd(), '/credinals.json');
var relativeCredinalsPath = path.relative(__dirname, absoluteCredinalsPath);

var credinals = fs.existsSync(absoluteCredinalsPath) ? require(relativeCredinalsPath) : null;

module.exports = {
    getCredinals: getAuthInfo

};

function createCredinalsFile(data) {
    fs.writeFile(absoluteCredinalsPath, data, function () {
        console.log('The file ' + absoluteCredinalsPath.toString() + ' was saved!');
    });
}

function getAuthInfo() {
    var promise,
        properties = [{
        description: 'username',
        name: 'user'
    }, {
        description: 'password',
        name: 'pass',
        hidden: true
    }, {
        description: 'Save to crendinals.json? Y/N',
        name: 'needToSave',
        conform: function conform(res) {
            return res === 'Y' || res === 'N';
        }
    }];

    prompt.start();

    promise = new Promise(function (resolve, reject) {
        if (!credinals || !credinals.pass || !credinals.user) {
            prompt.get(properties, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    credinals = { user: res.user, pass: res.pass };
                    if (res.needToSave === 'Y') {
                        createCredinalsFile(JSON.stringify(credinals));
                    }
                    resolve(credinals);
                }
            });
        } else {
            resolve(credinals);
        }
    });

    return promise;
}