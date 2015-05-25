let prompt = require('prompt');
let fs = require('fs');
let path = require('path');
let Promise = require('promise');

let absoluteCredinalsPath = path.join(process.cwd(), '/credinals.json');
let relativeCredinalsPath = path.relative(__dirname, absoluteCredinalsPath);

let credinals = fs.existsSync(absoluteCredinalsPath) ?  require(relativeCredinalsPath) : null;

module.exports = {
    getCredinals: getAuthInfo

};

function createCredinalsFile(data) {
    fs.writeFile(absoluteCredinalsPath, data, function () {
        console.log("The file " + absoluteCredinalsPath.toString() + " was saved!");
    });
}

function getAuthInfo() {
    let promise,
        properties = [{
            description: 'username',
            name: 'user'
        },{
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

    prompt.start();

    promise = new Promise(function(resolve, reject) {
        if (!credinals || !credinals.pass || !credinals.user) {
            prompt.get(properties, function (err, res) {
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

    return promise;
}
