var release = require('./dist/release.js');
var teamcity = require('./dist/teamcity.js');
var confluence = require('./dist/confluence.js');

module.exports = {
	release: release,
	teamcity: teamcity,
	confluence: confluence
};