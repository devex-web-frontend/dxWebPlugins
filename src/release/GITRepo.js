let GIT  = require('gift');
let Promise = require('promise');

class GITRepo {
	constructor(cwd) {
		this.GITSpawn = GIT(cwd);
	}

	add(files) {
		return new Promise((resolve, reject) => {
			return this.GITSpawn.add(files, (err, data) => {
				err ? reject(err) : resolve(data);
			});
		});
	}

	commit(comment) {
		return new Promise((resolve, reject) => {
			return this.GITSpawn.commit(comment, (err, data) => {
				err ? reject(err) : resolve(data);
			});
		});
	}

	getStatus() {
		return new Promise((resolve, reject) => {
			return this.GITSpawn.status(function(err, data) {
				err ? reject(err) : resolve(data);
			})
		})
	}

	push(dest) {
		return new Promise((resolve, reject) => {
			return this.GITSpawn.remote_push(dest, function(err, data) {
				err ? reject(err) : resolve(data);
			})
		})
	}

	sync() {
		return new Promise((resolve, reject) => {
			return this.GITSpawn.sync(function(err, data) {
				err ? reject(err) : resolve(data);
			})
		})
	}

	createTag(tagName) {

		return new Promise((resolve, reject) => {
			return this.GITSpawn.create_tag(tagName, function(err, data) {
				err ? reject(err) : resolve(data);
			});
		});
	}
}

module.exports = GITRepo;