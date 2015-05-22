var confluence = require('./index.js').confluence;
var pages = [{
	name: 'darkScheme',
	id: 1037774510
}, {
	id: 104825455
}, {
	name: 'ttt',
	id: 104825455
}];

confluence.read(pages,'/test/out/test.styl');
