'use strict';

var buffer = require('./helpers/buffer.js');
var styl = require('./helpers/stylusGenerator.js');

var pages = [],
    result = [],
    destination = '/';

module.exports = {
    read: read
};

function errorHandler(err) {
    console.error('Error reading: ' + err);
}

function readPage(pageIndex) {
    var page = pages[pageIndex],
        pageId = undefined,
        pageName = undefined;

    if (!page) {
        styl.write(result, destination);
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
    if (pages && pages.length) {
        readPage(0);
    } else {
        errorHandler('No pages in config');
    }
}

function read(source, dest) {
    pages = source;
    destination = dest || 'test.styl';

    readAllPages();
}