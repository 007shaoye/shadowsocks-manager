// 'use strict';
// console.log('GG');
var dgram = require('dgram');
var socket = dgram.createSocket('udp4');
/*
add: {"server_port": 8001, "password":"7cd308cc059"}
remove: {"server_port": 8001}
*/

// var express = require('express');
var app = global.app;

var add = exports.add = function (server, account) {
    var ip   = server.ip;
    var port = server.port;
    var accountPort = account.port;
    var password = account.password;

    // var message = 'add: {"server_port": ' + accountPort + ', "password": "' + password + '"}';
    // socket.send(message, 0, message.length, port, ip, function(err, bytes) {
    //     console.log(err, bytes);
    //     socket.on('message', function(m, r) {
    //         var msg = String(m);
    //         console.log(msg);
    //     });
    // });
};



app.post('/ttt', function(req, res) {
    add({ip: '188.166.222.115', port: 6001}, {port: 10101, password: 'gyttyg'});
    res.send('success');
});