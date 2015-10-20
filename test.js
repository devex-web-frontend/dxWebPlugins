var confluence = require('./index.js').confluence;

var pagesToRead = [{
		name: 'darkScheme',
		id: 103777451
	}, {
		id: 104825455,
		useHex: true
	}];

var config = [{
	pages: [103777451, 103777451],
	destination: 'dark.styl'
}, {
	pages: pagesToRead,
	useHex: true,
	destination: '/light.styl'
}];

var pagesToWrite = {
	NumericStepper: 108139548
};

function done() {
	console.log('converting process finished');
}
function errorHandler(err) {
	console.log('Converting process failed:', err);
}
confluence.readToFile(pagesToRead, '/test/out/test.styl')
		.then(done)
		.catch(errorHandler);

confluence.readToMultipleFiles(config)
		.then(done)
		.catch(errorHandler);

//confluence.write(pagesToWrite)
//		.then(done)
//		.catch(errorHandler);
