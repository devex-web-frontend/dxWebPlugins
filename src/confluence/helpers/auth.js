let prompt = require('prompt');
let fs = require('fs');
let path = require('path');
let Promise = require('promise');

let absoluteCredinalsPath = path.join(process.cwd(), '/credinals.json');
let relativeCredinalsPath = path.relative(__dirname, absoluteCredinalsPath);

let credinals = fs.existsSync(absoluteCredinalsPath) ? require(relativeCredinalsPath) : null;

module.exports = {
	getCredinals: getAuthInfo
};

function createCredinalsFile(data) {
	fs.writeFile(absoluteCredinalsPath, data, function() {
		console.log("The file " + absoluteCredinalsPath.toString() + " was saved!");
	});
}
/**
 * Returns promise for getting user credinals
 * @param {Boolean=} needToSave – whether credinals should be saved into JSON
 * @return {Promise.<{user: String, pass: String}>}
 */
function getAuthInfo(needToSave = false) {
	let properties = [{
			description: 'username',
			name: 'user'
		}, {
			description: 'password',
			name: 'pass',
			hidden: true
		}],
		saveCredinals = {
			description: 'Save to crendinals.json? Y/N',
			name: 'needToSave',
			conform: function(res) {
				return res === 'Y' || res === 'N';
			}
		};
	if (needToSave) {
		properties.push(saveCredinals);
	}
	prompt.start();

	return new Promise((resolve, reject) => {
		if (!credinals || !credinals.pass || !credinals.user) {
			prompt.get(properties, (err, res) => {
				if (err) {
					reject(err);
				} else {
					credinals = {user: res.user, pass: res.pass};
					if (res.needToSave === 'Y') {
						createCredinalsFile(JSON.stringify(credinals));
					}
					resolve(credinals);
				}
			});
		} else {
			resolve(credinals);
		}
	});

}
