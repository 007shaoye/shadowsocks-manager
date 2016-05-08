// require('./routes/login');
// require('./routes/admin');
var express = global.express = require('express');
var app = global.app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Shadowsocks-Manager');


app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use('/libs', express.static('./bower_components'));
app.use('/public', express.static('./public'));

var config = require('../config').conf;
var fs = require('fs');

var log4js = require('log4js');
var logger = log4js.getLogger('server');

var log4js = exports.log4js = function(cb) {
    var log4js = require('log4js');
    log4js.configure({
        appenders: [{
            type: 'console',
            category: 'server'
        }, {
            type: 'dateFile',
            filename: 'logs/server.log',
            pattern: '-yyyy-MM-dd',
            alwaysIncludePattern: true,
            category: 'server'
        }]
    });
    cb(null);
};


exports.db = function (cb) {
    logger.info('db');
    // var mongoose = require('mongoose');
    // mongoose.connect('mongodb://localhost/Shadowsocks-Manager');
    fs.readdir('./server/models', function(err, files) {
        if(err) {logger.error(err);}
        files.forEach(function(file) {
            require('../server/models/' + file);
        });
        cb(err);
    });
};

exports.express = function(cb) {
    var bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    var session = require('express-session');
    var MongoStore = require('connect-mongo')(session);
    app.use(session({
        secret: 'foo',
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
        resave: false,
        saveUninitialized: false
    }));

    require('./routes/login');
    require('./routes/admin');

    var server = app.listen(6003, function () {});
    cb(null);
};