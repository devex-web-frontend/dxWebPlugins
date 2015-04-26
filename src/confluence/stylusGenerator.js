var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

module.exports = {
    write : createStyl
};

function write(text)
{
    fs.writeFile(path.join(process.cwd(), "/test/out/stylus/test.styl"), text, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
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

function createStyl(string, name) {
   var map =  parseTable(string);
   var result = '';
   result = name ? ('$' + name + ' = { \n') : '';
    Object
        .keys(map)
        .forEach(function(key){
            result += '    '+ key + ' : ' + map[key] + ',';
            result += '\n';
        });
    result += name ? '};\n' : '';
    write(result)
}