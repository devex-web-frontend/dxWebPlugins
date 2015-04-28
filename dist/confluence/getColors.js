'use strict';

var buffer = require('./helpers/buffer.js');
var styl = require('./helpers/stylusGenerator.js');

var pages = [{
    name: 'darkScheme',
    id: 103777451
}, {
    name: 'chartScheme',
    id: 104825455
}],
    result = [];

function errorHandler(err) {
    console.error('Error: ', err);
}

function readPage(pageIndex) {
    var pageId = pages[pageIndex].id,
        pageName = pages[pageIndex].name,
        nextPage = pages[pageIndex + 1];

    buffer.read(pageId).then(function (respond) {
        console.log('Succsessfully read ', pageId);
        result.push({
            name: pageName,
            data: respond.body.view.value
        });
        if (nextPage) {
            readPage(pageIndex + 1);
        } else {
            styl.write(result);
        }
    }, errorHandler);
}

function readAllPages() {
    readPage(0);
}

readAllPages();