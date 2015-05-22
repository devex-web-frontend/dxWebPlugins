var release = require('./dist/release.js');
var teamcity = require('./dist/teamcity.js');
var confluence = require('./src/confluence.js');

module.exports = {
	release: release,
	teamcity: teamcity,
	confluence: confluence
};