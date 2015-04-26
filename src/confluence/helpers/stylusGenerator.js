var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

module.exports = {
    write : generateStylusFile
};


function writeToFile(text) {
    var fileName = "/test.styl";
    var folderPath = path.join(process.cwd(), "/test/out");
    var relativePath = folderPath + fileName;

    if (!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath);
        folderPath += '/styl';
        fs.mkdirSync(folderPath);
    }

    fs.existsSync(relativePath, function (exists) {
        if(!exists) {
            fs.writeFile(relativePath, {flag: 'wx'});
        }
    });
    fs.writeFile(relativePath, text, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file "+ relativePath +" was saved!");
    });
}

function parseTable(string) {
    var $ = cheerio.load(string);
    var map = {};
    $('tr').each(function(t, elem) {
        var index = $('td:first-child', elem).html();
        var names = '' + $('td:last-child span ', elem).text();
        var color = '' + $('td:first-child + td + td', elem).attr('style');
        names = (names.split(','));
        color = color.slice(18, color.length - 1);
        names.forEach(function(name) {
            name = name.toLowerCase().trim();
            if (name) {
                map[name] = color;
            }
        });

    });
    return map;
}

function createHashObject(string, name) {
   var map =  parseTable(string);
   var result = '';
   result = name ? ('$' + name + ' = { \n') : '';
    Object
        .keys(map)
        .forEach(function(key){

            result += '    '+ key + ' : ' + map[key];
            result += '\n';
        });
    result += name ? '};\n' : '';
    return result;
}

function generateStylusFile(dataMap) {
    var result = '';

    Object
        .keys(dataMap)
        .forEach(function(key) {

            result += createHashObject(dataMap[key], key);
        });
    writeToFile(result);
}