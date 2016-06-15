var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Option = mongoose.model('Option');

var async = require('async');

exports.getOptions = function (req, res) {
    var getOptions = {};
    var options = {};
    getOptions.freeServer = function(cb) {
        Option.findOne({name: 'freeServer'}).exec(function(err, data) {
            if(err) {return cb(err);}
            options.freeServer = data || {};
            cb(null);
        });
    };
    async.auto(getOptions, function(err, data) {
        if(err) {return res.status(403).end();}
        res.send(options);
    });
};

exports.setOptions = function (req, res) {
    var name = req.body.name;
    var value = req.body.value;
    Option.findOneAndUpdate({
        name: name
    }, {
        $set: {
            value: value
        }
    }, {
        new: true,
        upsert: true
    }).exec(function(err, data) {
        if(err) {return res.status(403).end();}
        res.send(data);
    });
};