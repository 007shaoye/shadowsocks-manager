var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = mongoose.model('User');

var crypto = require('crypto');
var md5 = function(text) {
        return crypto.createHash('md5').update(text).digest('hex');
};

var createPassword = function(password, date, username) {
    return md5(password + date + username);
};

exports.signup = function(req, res) {

    var email = req.body.username;
    var password = req.body.password;

    User.findOne({email: email}).exec(function(err, data) {
        if(err) {return res.status(500).end('数据库操作错误');}
        else if(data) {return res.status(403).end('该用户已注册');}
        var user = new User();
        user.email = email;
        user.createTime = new Date();
        user.password = createPassword(password, createTime, email);
        user.save(function(err, data) {
            if(err) {return res.status(500).end('数据库操作错误');}
            return res.send('success');
        });
    });
};

exports.login = function(req, res) {
    var email = req.body.username;
    var password = req.body.password;

    User.findOne({email: email}).exec(function(err, user) {
        if(err) {return res.status(500).end('数据库操作错误');}
        else if(!user) { return res.status(401).end('用户未注册');}
        var passwordWithMd5 = createPassword(password, user.createTime, user.email);
        if(passwordWithMd5 !== user.password) {
            return res.status(401).end('用户名或密码错误');
        }
        req.session.user = email;
        req.session.isAdmin = user.isAdmin;
        req.session.save();
        res.send('success');
    });
};

exports.logout = function(req, res) {
    req.session.destroy();
    res.send('logout');
};