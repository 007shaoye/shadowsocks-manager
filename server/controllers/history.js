var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HistoryOriginal = mongoose.model('HistoryOriginal');
var HistoryHour = mongoose.model('HistoryHour');

var moment = require('moment');
var async = require('async'); 

var createHistoryHour = {};

createHistoryHour.getTimeStart = function(cb) {
    HistoryHour.findOne({}).sort({time: -1}).exec(function (err, data) {
        if(err) {return cb(err);}
        if(data) {
            return cb(null, moment(data.time).add(1, 'hour').toDate());}
        HistoryOriginal.findOne({}).sort({time: 1}).exec(function (err, data) {
            if(err) {return cb(err);}
            if(!data) {return cb('no history');}
            cb(null, moment(data.time).minute(0).second(0).millisecond(0).toDate());
        });
    });
};
createHistoryHour.getHistory = ['getTimeStart', function(results, cb) {
    var timeStart = results.getTimeStart;
    var timeEnd = moment(results.getTimeStart).add(1, 'hour').toDate();
    if(timeEnd > new Date()) {return cb('not enough time');}
    var query = [];
    query[0] = {
        $match: {
            time: {
                $gte: timeStart,
                $lt: timeEnd
            }
        }
    };
    query[1] = {
        $group: {
            _id: {name: '$name', port: '$port'},
            flow: {$sum: '$flow'}
        }
    };
    query[2] = {
        $project: {
            _id: false,
            name: '$_id.name',
            port: '$_id.port',
            flow: '$flow'
        }
    };
    var hasFlow = true;
    while(!hasFlow) {
        HistoryOriginal.aggregate(query).exec(function(err, data) {
            if(err) {hasFlow = true; return cb(err);}
            if(!data) {
                timeStart = moment(timeStart).add(1, 'day').toDate();
                timeEnd = moment(timeEnd).add(1, 'day').toDate();
            }
            hasFlow = true;
            console.log(data);
            return cb(err, data);
        });
    }
    
}];
createHistoryHour.addHistory = ['getHistory', function(results, cb) {
    var parallel = [];
    results.getHistory.forEach(function(f) {
        parallel.push(function(cb) {
            var historyHour = new HistoryHour();
            historyHour.name = f.name;
            historyHour.port = f.port;
            historyHour.flow = f.flow;
            historyHour.time = results.getTimeStart;
            historyHour.save(cb);
        });
    });
    async.parallelLimit(parallel, 8, cb);
}];

exports.historyHour = function() {
    async.auto(createHistoryHour, function(err, results) {
        console.log(results.getHistory);
        // console.log(results.getTimeStart);
    });
};
