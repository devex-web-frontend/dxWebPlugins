'use strict';

var glob = require('glob');
var fs = require('fs');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var buffer = require('./helpers/buffer.js');

var pages = {
    NumericStepper: 108139548
};

function processFile(file) {
    var name = file.slice(0, file.indexOf('.'));
    var pageId = pages[name];
    if (pageId) {
        var filePath = path.join(process.cwd(), file);
        var buf = fs.readFileSync(filePath).toString();

        var result = prepareData(buf);
        writeToConfluence(pageId, result);
    }
}

function prepareData(data) {

    var startIndex = data.indexOf('<body>') ? data.indexOf('<body>') + '<body>'.length : 0,
        endIndex = data.indexOf('<nav>') ? data.indexOf('<nav>') : null;

    data = data.slice(startIndex, endIndex);

    data = sanitizeHtml(data, {
        transformTags: {
            dd: sanitizeHtml.simpleTransform('div'),
            dt: sanitizeHtml.simpleTransform('h5'),
            dl: sanitizeHtml.simpleTransform('div')
        },
        exclusiveFilter: function exclusiveFilter(frame) {
            return frame.attribs['class'] === 'tag-source';
        }
    });

    return data;
}

function writeToConfluence(pageId, data) {
    buffer.write(pageId, data).then(function () {
        console.log('Succesffuly written to ', pageId);
    })['catch'](handleError);
}

function handleError(err) {
    console.log('Error writing ', err);
}

function publishAll() {
    process.chdir('test/out/api');
    glob('*[!.]??.html', function (er, files) {
        delete files[files.indexOf('index.html')];
        files.forEach(processFile);
    });
}

publishAll();