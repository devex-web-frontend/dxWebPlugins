var glob = require("glob");
var fs = require('fs');
var path = require('path');

var buffer = require('../confluence/buffer.js');

function replaceAll(src, str, newStr) {
    return src.replace(new RegExp(str, 'g'), newStr)
}
function getDoc() {
    process.chdir('test/out/api');
    glob("*[!.]??.html",  function (er, files) {
        delete files[files.indexOf('index.html')];
        var file = files[0];
        var filePath = path.join(process.cwd(), file);
        var buf = fs.readFileSync(filePath).toString();

        var result = prepareData(buf);
        console.log(result)
        write(result)
    })
}
function prepareData(data) {
    var startIndex = data.indexOf('<body>') ? data.indexOf('<body>') + 7 : 0,
        endIndex = data.indexOf('<nav>') ? data.indexOf('<nav>') : null;

    data = data.slice(startIndex, endIndex);

    data = data.replace(new RegExp('<(/*)d[tld](>*)', 'g'), '<$1div$2');

    return data
}
function write(data){
    buffer.write(108139548, data)
};

getDoc();

