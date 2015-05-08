'use strict';

var buffer = require('./helpers/buffer.js');
var styl = require('./helpers/stylusGenerator.js');

var pages = [{
    name: 'darkScheme',
    id: 103777451
}, {
    id: 104825455
}],
    result = [];

function errorHandler(err) {
    console.error('Error reading: ' + err);
}

function readPage(pageIndex) {
    var page = pages[pageIndex],
        pageId = undefined,
        pageName = undefined;

    if (!page) {
        styl.write(result);
    } else {
        pageId = page.id;
        pageName = page.name;

        buffer.read(pageId).then(function (respond) {
            console.log('Succsessfully read ' + pageId);
            result.push({
                name: pageName,
                data: respond.body.view.value
            });
            readPage(pageIndex + 1);
        })['catch'](function (err) {
            errorHandler(err);
            readPage(pageIndex + 1);
        });
    }
}

function readAllPages() {
    readPage(0);
}

readAllPages();