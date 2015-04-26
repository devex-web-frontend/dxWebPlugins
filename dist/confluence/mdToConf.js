"use strict";

var glob = require("glob");
var run = require("gulp-run");
var exec = require("child_process").exec;
var convert = require("markdown2confluence");
var fs = require("fs");
var path = require("path");

var conf = require("../confluence/login.js");

function replaceAll(src, str, newStr) {
    return src.replace(new RegExp(str, "g"), newStr);
}
function mdToConf() {
    process.chdir("test/out/api");
    glob("*[!.]??.html", function (er, files) {
        delete files[files.indexOf("index.html")];
        var file = files[0];
        var filePath = path.join(process.cwd(), file);
        var buf = fs.readFileSync(filePath).toString();

        data = data.slice(data.indexOf("<body>") + 7, data.indexOf("<nav>"));

        data = replaceAll(data, "<dd", "<div");

        data = replaceAll(data, "dd>", "div>");
        data = replaceAll(data, "<dt", "<div");
        data = replaceAll(data, "dt>", "div>");
        data = replaceAll(data, "<dl", "<div");
        data = replaceAll(data, "dl>", "div>");

        conf.write(108139548, data);
    });
};

mdToConf();