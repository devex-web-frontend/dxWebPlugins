'use strict';

var buffer = require('./helpers/buffer.js');
var styl = require('./helpers/stylusGenerator.js');
var Promise = require('promise');

var pages = [],
    result = [],
    destination = '/',
    doneFunction = function doneFunction() {};

module.exports = {
    read: read
};

function errorHandler(err) {
    console.error('Error reading: ' + err);
}
function readPromise(pageIndex) {
    var page = pages[pageIndex],
        pageId = undefined,
        pageName = undefined;

    pageId = page.id;
    pageName = page.name;

    return new Promise(function (resolve, reject) {
        buffer.read(pageId).then(function (respond) {
            console.log('Succsessfully read ' + pageId);
            result.push({
                name: pageName,
                data: respond.body.view.value
            });
            resolve({
                name: pageName
            });
        })['catch'](resolve);
    });
}

function readAllPages() {
    if (pages && pages.length) {
        var promises = pages.map(function (page, i) {
            return readPromise(i);
        });
        Promise.all(promises).then(function (result) {
            //styl.write(result, destination).then(function(){doneFunction()});
            console.log(result);
        }, function (err) {
            console.log(err);
        });
    } else {
        errorHandler('No pages in config');
    }
}

function read(source, dest, done) {
    pages = source;
    //doneFunction = done;
    //destination = dest || 'test.styl';
    readAllPages();
}