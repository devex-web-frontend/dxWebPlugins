var read = require('./../dist/confluence/getColors.js');
var write = require('./../dist/confluence/publishJSdoc.js');

module.exports = {
	read: read.read,
	write: write.write
}