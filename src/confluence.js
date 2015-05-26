var read = require('./../dist/confluence/getColors.js');
var write = require('./../dist/confluence/publishHTML.js');

module.exports = {
	readToFile: read.readToFile,
	readToMultipleFiles: read.readToMultipleFiles,
	write: write.write
}