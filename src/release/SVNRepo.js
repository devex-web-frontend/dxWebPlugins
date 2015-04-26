let SVN  = require('svn-spawn');
let Promise = require('promise');

class SVNRepo {
	constructor(cwd) {
		this.SVNSpawn = new SVN(cwd);
	}

	add(files) {
		return new Promise((resolve, reject) => {
			return this.SVNSpawn.add(files, (err, data) => {
				err ? reject(err) : resolve(data);
			});
		});
	}

	commit(comment) {
		return new Promise((resolve, reject) => {
			return this.SVNSpawn.commit(comment, (err, data) => {
				err ? reject(err) : resolve(data);
			});
		});
	}

	getInfo() {
		return new Promise((resolve, reject) => {
			return this.SVNSpawn.getInfo(function(err, data) {
				err ? reject(err) : resolve(data);
			})
		})
	}

	createTag(tagName) {

		return new Promise((resolve, reject) => {
			return this.getInfo().then((info) => {
				let trunkFolder = info.url;
				let tagsFolder = trunkFolder.replace('trunk', 'tags');
				let destination = tagsFolder + '/' + tagName;

				return this.SVNSpawn.cmd(['copy', trunkFolder, destination, `-m="tag ${tagName}"`], function(err, data) {
					err ? reject(err) : resolve(data);
				});
			})
		});
	}
}

module.exports = SVNRepo;