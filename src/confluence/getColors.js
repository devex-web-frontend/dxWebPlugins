var buffer = require('./helpers/buffer.js');
var styl = require('./helpers/stylusGenerator.js');

var pageIds = [{
        name: 'darkScheme',
        id: 103777451
    },{
        name: 'chartScheme',
        id: 104825455
    }],
    result = {};

function errorHandler(err) {
    console.log('Error: ',err);
}

function readPage(pageIndex) {
    var pageId = pageIds[pageIndex].id;
    var pageName = pageIds[pageIndex].name;
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

function readAllPages() {
    readPage(0);
}

readAllPages();

