var buffer = require('../confluence/buffer.js');
var styl = require('../confluence/stylusGenerator.js');

var pageIds = [
    {
        name: 'darkScheme',
        id:103777451
    },
    {
        name: 'chartScheme',
        id:104825455
    }
];
var result = {};

function errorHandler(err) {
    console.log('Error: ',err);
}

function readAllPages() {
    readPage(0);
}

function readPage(pageIndex) {
    var pageId = pageIds[pageIndex].id;
    var pageName = pageIds[pageIndex].name
    var nextPage = pageIds[pageIndex + 1];

   buffer.read(pageId).then(function(respond) {
      console.log('Succsessfully read ', pageId);
      result[pageName] = respond.body.view.value;
      if (nextPage) {
          readPage(pageIndex + 1)
      } else {
          styl.write(result);
      }
  }, errorHandler)
}

readAllPages();

