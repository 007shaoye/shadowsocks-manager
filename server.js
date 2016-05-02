var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Shadowsocks-Manager');

require('./server/models/server');
require('./server/models/user');


var express = require('express');
var app = global.app = express();
var router = global.router = express.Router();
require('./server/app');

var server = app.listen(6003, function () {});