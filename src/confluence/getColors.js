let buffer = require('./helpers/buffer.js');
let styl = require('./helpers/stylusGenerator.js');

let pages = [{
        name: 'darkScheme',
        id: 103777451
    },{
        name: 'chartScheme',
        id: 1048254552
    }],
    result = [];

function errorHandler(err) {
    console.error('Error reading: ', err);
}

function readPage(pageIndex) {
    let page = pages[pageIndex],
        pageId,
        pageName;

    if (!page) {
        styl.write(result);
    } else {
        pageId = page.id;
        pageName = page.name;

        buffer.read(pageId)
            .then(function (respond) {
                console.log('Succsessfully read ', pageId);
                result.push({
                    name: pageName,
                    data: respond.body.view.value
                });
                readPage(pageIndex + 1);
            })
            .catch(function (err) {
                errorHandler(err);
                readPage(pageIndex + 1);
            });
    }
}

function readAllPages() {
    readPage(0);
}

readAllPages();

