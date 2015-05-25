var confluence = require('./index.js').confluence;
var pages = [{
	name: 'darkScheme',
	id: 103777451
}, {
	id: 104825455
}];
function done() {
	console.log('converting process finished')
}
function errorHandler(err) {
	console.log('Converting process failed:', err)
}
confluence.read(pages, '/test/out/test.styl')
		.then(done)
		.catch(errorHandler);
