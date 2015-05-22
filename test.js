var confluence = require('./index.js').confluence;
var pages = [{
	name: 'darkScheme',
	id: 103777451
}, {
	id: 104825455
}];

confluence.read(pages,'/test/out/test.styl');
