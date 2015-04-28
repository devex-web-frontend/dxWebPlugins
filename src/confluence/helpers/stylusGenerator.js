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

function generateStylusFile(dataArray) {
    var result = '';

    dataArray.forEach(function(page) {
        result += createHashObject(page.data, page.name);
    });

    writeToFile(result,'/test/out/styl/test.styl');
}

//createFolders('/test/out/styl/test.styl');