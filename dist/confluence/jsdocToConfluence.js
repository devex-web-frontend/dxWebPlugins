'use strict';

var glob = require('glob');
var fs = require('fs');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

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

    data = sanitizeHtml(data, {
        transformTags: {
            dd: 'div',
            dt: sanitizeHtml.simpleTransform('h5'),
            dl: sanitizeHtml.simpleTransform('div')
        },
        exclusiveFilter: function exclusiveFilter(frame) {
            return frame.attribs['class'] === 'tag-source';
        }
    });

    return data;
}
function write(data) {
    buffer.write(108139548, data).then(function (result) {
        console.log('Succesffuly written');
    }, handleError);
};

function handleError(err) {
    console.log('Error ', err);
}
getDoc();