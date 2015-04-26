'use strict';

var glob = require('glob');
var fs = require('fs');
var path = require('path');

var buffer = require('../confluence/buffer.js');

function getDoc() {
    process.chdir('test/out/api');
    glob('*[!.]??.html', function (er, files) {
        delete files[files.indexOf('index.html')];
        var file = files[0];
        var filePath = path.join(process.cwd(), file);
        var buf = fs.readFileSync(filePath).toString();

        var result = prepareData(buf);
        write(result);
    });
}
function prepareData(data) {
    var startIndex = data.indexOf('<body>') ? data.indexOf('<body>') + 7 : 0,
        endIndex = data.indexOf('<nav>') ? data.indexOf('<nav>') : null;

    data = data.slice(startIndex, endIndex);

    data = data.replace(new RegExp('<(/*)d[tld](>*)', 'g'), '<$1div$2');

    return data;
}
function write(data) {
    data = '4444';
    buffer.write(108139548, data).then(function (result) {
        console.log('Succesffuly written');
    }, handleError);
};

function handleError(err) {
    console.log('Error ', err);
}
getDoc();