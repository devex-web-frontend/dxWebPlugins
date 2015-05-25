var confluence = require('./index.js').confluence;
var pages = [{
	name: 'darkScheme',
	id: 103777451
}, {
	id: 104825455
}];
var config = [{
	pages: [103777451, 103777451],
	destination:'/dark.styl'},{
	pages: pages,
	destination:'/light.styl'}];

function done() {
	console.log('converting process finished')
}
function errorHandler(err) {
	console.log('Converting process failed:', err)
}
confluence.readToFile(pages, '/test/out/test.styl')
		.then(done)
		.catch(errorHandler);
confluence.readToMultipleFiles(config)
		.then(done)
		.catch(errorHandler);
