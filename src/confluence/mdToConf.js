var glob = require("glob");
var run = require("gulp-run");
var exec = require('child_process').exec;
var convert = require('markdown2confluence');
var fs = require('fs');
var path = require('path');

var conf = require('../confluence/login.js');

function replaceAll(src, str, newStr) {
    return src.replace(new RegExp(str, 'g'), newStr)
}
function mdToConf(){
    process.chdir('api');
    glob("*[!.]??.html",  function (er, files) {
        delete files[files.indexOf('index.html')];
        var file  =files[0];
        var filePath = path.join(process.cwd(), file);
        var buf = fs.readFileSync(filePath).toString();

        buf = buf.slice(buf.indexOf('<body>') + 7, buf.indexOf('<nav>'));

        buf = replaceAll(buf, '<dd', '<div')

        buf =  replaceAll(buf, 'dd>', 'div>')
        buf =   replaceAll(buf, '<dt', '<div')
        buf =   replaceAll(buf, 'dt>', 'div>')
        buf =   replaceAll(buf, '<dl', '<div')
        buf =   replaceAll(buf, 'dl>', 'div>')

        conf.write(108139548, buf)
    })
};

mdToConf();

