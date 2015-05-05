var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

module.exports = {
    write : generateStylusFile
};

function createFolders(relativePath){
    var folders = relativePath.split('/').slice(1),
        fileName = folders.pop(),
        folderPath = process.cwd();

    folders.forEach(function(folderName) {
        folderPath = path.join(folderPath,  folderName);
        if (!fs.existsSync(folderPath)){
            fs.mkdirSync(folderPath);
        }
    });

    return path.join(folderPath, fileName)
}

function writeToFile(text, relativePath) {

    var absolutePath = createFolders(relativePath);
    fs.writeFile(absolutePath, text, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file " + relativePath + " was saved!");
    });
}

function parseTable(string) {
    var $ = cheerio.load(string),
        map = {};

    $('tr').each(function(t, elem) {
        var colorIndex = $('td:first-child', elem).html(),
            names = '' + $('td:last-child span ', elem).text(),
            color = '' + $('td:first-child + td + td', elem).attr('style');

        names = (names.split(','));
        color = color.slice(('background-color: ').length, color.length - 1);

        names.forEach(function(name) {
            if (name) {
                name = name.toLowerCase().trim();
                map[name] = color;
            }
        });
    });

    return map;
}

function wrapHash(hashName, hash) {
    var result = '';
    if (hashName) {
        hash = hash.slice(0, hash.length - 2) + '\n';
        result += '$' + hashName + ' = { \n';
        result += hash;
        result += '};\n';
    } else {
        result = hash;
    }
    return result;
}

function composeLine(varName, varValue, isInHash) {
    if (isInHash) {
        return '\t' + varName + ' : ' + varValue + ',\n';
    }
    return '$' + varName + ' = ' + varValue + ';\n';

}

function createPageVariables(string, name) {
   var map = parseTable(string),
    result = '';

   Object
       .keys(map)
       .forEach(function(key) {
            result += composeLine(key, map[key], !!name);
        });

    return wrapHash(name, result);
}

function generateStylusFile(dataArray) {
    var result = '';

    dataArray.forEach(function(page) {
        result += createPageVariables(page.data, page.name);
    });

    writeToFile(result, '/test/out/styl/test.styl');
}