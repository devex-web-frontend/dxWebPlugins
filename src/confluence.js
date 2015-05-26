var read = require('./confluence/getColors.js');
var write = require('./confluence/publishHTML.js');

module.exports = {
	readToFile: read.readToFile,
	readToMultipleFiles: read.readToMultipleFiles,
	write: write.write
}