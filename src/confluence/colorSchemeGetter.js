var buffer = require('../confluence/buffer.js');
var styl = require('../confluence/stylusGenerator.js');

var darkScheme = 103777451;
var chartScheme = 104825455;
function errorHandler(err) {
    console.log('Error: ',err);
}
buffer.read(darkScheme).then(function(respond) {
    var body = respond.body.view.value;
    styl.write(body, 'darkScheme');
}, errorHandler);

