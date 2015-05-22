let buffer = require('./helpers/buffer.js');
let styl = require('./helpers/stylusGenerator.js');

let pages = [],
    result = [],
    destination = '/',
    doneFunction = function(){};

module.exports = {
    read: read
};

function errorHandler(err) {
    console.error(`Error reading: ${err}`);
}

function readPage(pageIndex) {
    let page = pages[pageIndex],
        pageId,
        pageName;

    if (!page) {
        return styl.write(result, destination).then(function(){doneFunction()});
    } else {
        pageId = page.id;
        pageName = page.name;

        return buffer.read(pageId)
            .then(function (respond) {
                console.log(`Succsessfully read ${pageId}`);
                result.push({
                    name: pageName,
                    data: respond.body.view.value
                });
                return readPage(pageIndex + 1);
            })
            .catch(function (err) {
                errorHandler(err);
                return readPage(pageIndex + 1);
            });
    }
}

function readAllPages() {
    if (pages && pages.length) {
       console.log(readPage(0));
    } else {
        errorHandler('No pages in config');
    }
}


function read(source, dest, done) {
    pages = source;
    doneFunction = done;
    destination = dest || 'test.styl';
    readAllPages();
}
