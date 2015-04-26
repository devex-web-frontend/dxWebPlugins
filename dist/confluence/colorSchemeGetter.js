'use strict';

var buffer = require('../confluence/buffer.js');
var styl = require('../confluence/stylusGenerator.js');

var darkScheme = 103777451;
var chartScheme = 104825455;

buffer.read(darkScheme, function (respond) {
    var body = respond.body.view.value;
    styl.write(body, 'darkScheme');
});