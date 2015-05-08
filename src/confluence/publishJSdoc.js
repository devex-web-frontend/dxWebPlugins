let glob = require("glob");
let fs = require('fs');
let path = require('path');
let sanitizeHtml = require('sanitize-html');

let buffer = require('./helpers/buffer.js');

let pages = {
    NumericStepper: 108139548
};

function processFile(file){
    let name = file.slice(0, file.indexOf('.'));
    let pageId = pages[name];
    if (pageId) {
        let filePath = path.join(process.cwd(), file);
        let buf = fs.readFileSync(filePath).toString();

        let result = prepareData(buf);
        writeToConfluence(pageId, result);
    }
}

function prepareData(data) {

    let startIndex = data.indexOf('<body>') ? data.indexOf('<body>') + ('<body>').length : 0,
        endIndex = data.indexOf('<nav>') ? data.indexOf('<nav>') : null;

    data = data.slice(startIndex, endIndex);

    data = sanitizeHtml(data, {
        transformTags: {
            'dd': sanitizeHtml.simpleTransform('div'),
            'dt': sanitizeHtml.simpleTransform('h5'),
            'dl': sanitizeHtml.simpleTransform('div')
        },
        exclusiveFilter: function(frame) {
            return frame.attribs.class === "tag-source"
        }
    });

    return data;
}

function writeToConfluence(pageId, data) {
    buffer.write(pageId, data)
        .then(function() {
            console.log('Succesffuly written to ', pageId);
        })
        .catch(handleError);
}

function handleError(err) {
    console.log('Error writing ', err)
}

function publishAll() {
    process.chdir('test/out/api');
    glob("*[!.]??.html",  function (er, files) {
        delete files[files.indexOf('index.html')];
        files.forEach(processFile);
    })
}

publishAll();

