var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Server = mongoose.model('Server');
var HistoryOriginal = mongoose.model('HistoryOriginal');
var moment = require('moment');

var log4js = require('log4js');
var logger = log4js.getLogger('admin');

var shadowsocks = require('./shadowsocks');

exports.getServers = function (req, res) {
    var query = {};
    if(req.query.serverName) {
        query.name = req.query.serverName;
    }
    Server.find(query).exec(function(err, servers) {
        if(err) {return res.status(500).end('数据库错误');}
        return res.send(servers);
    });
};

exports.addServer = function (req, res) {
    var name = req.body.name;
    var ip = req.body.ip;
    var port = req.body.port;
    

    var server = new Server();
    
    server.name = name;
    server.ip = ip;
    server.port = port;

    server.save(function(err, data) {
        if(err) {return res.status(500).end('数据库错误');}
        logger.info('新增服务器: [' + name + '][' + ip + ':' + port + ']');
        return res.send(data);
    });
};

exports.editServer = function(req, res) {
    var name = req.body.name;
    var ip = req.body.ip;
    var port = req.body.port;

    Server.findOneAndUpdate({name: name}, {
        $set: {
            ip: ip,
            port: port
        }
    }).exec(function(err, data) {
        if(err) {return res.status(500).end('数据库错误');}
        if(!data) {return res.status(401).end('找不到ServerName');}
        logger.info('修改服务器: [' + name + '][' + ip + ':' + port + ']');
        return res.send(data);
    });
};

exports.deleteServer = function(req, res) {
    var name = req.query.name;
    if(!name) {return res.status(401).end('必须提供ServerName');}
    Server.findOneAndRemove({name: name}).exec(function(err, data) {
        if(err) {return res.status(500).end('数据库错误');}
        if(!data) {return res.status(401).end('找不到ServerName');}
        logger.info('删除服务器: [' + data.name + '][' + data.ip + ':' + data.port + ']');
        return res.send(data);
    });
};



exports.addAccount = function(req, res) {
    var name = req.body.name;
    var port = req.body.port;
    var password = req.body.password;

    Server.findOneAndUpdate({
        name: name
    }, {
        $push: {account: {
            port: port,
            password: password,
            expireTime: new Date()
        }}
    }).exec(function(err, data) {
        if(err) {return res.status(500).end('数据库错误');}
        // console.log(data);
        shadowsocks.add({
            ip: data.ip,
            port: data.port
        }, {
            port: port,
            password: password
        });
        return res.send(data);
    });
};

exports.deleteAccount = function(req, res) {
    var name = req.query.name;
    var port = req.query.port;

    Server.findOneAndUpdate({
        'name': name,
        'account.port': port
    }, {$pull: {
        account: {port: port}
    }}).exec(function(err, data) {
        if(err) {return res.status(500).end('数据库错误');}
        if(!data) {return res.send(data);}
        shadowsocks.del({
            ip: data.ip,
            port: data.port
        }, {
            port: port
        });
        return res.send(data);
    });
};

exports.getFlow = function(req, res) {
    var aggregate = [];
    var date = moment().hour(0).minute(0).second(0).toDate();
    aggregate.push({
        $match: {
            time: {$gt: date}
        }
    });
    aggregate.push({
        $group: {
            _id: {
                name: '$name',
                port: '$port'
            },
            flow: {
                $sum: '$flow'
            },
        }
    });
    aggregate.push({
        $project: {
            _id: false,
            name: '$_id.name',
            port: '$_id.port',
            flow: '$flow'
        }
    });
    HistoryOriginal.aggregate(aggregate).exec(function(err, data) {
        if(err) {return res.status(500).end('数据库错误');}
        res.send(data);
    });
};