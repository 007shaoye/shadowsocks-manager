'use strict';

const manager = appRequire('services/manager');
const serverManager = appRequire('plugins/flowSaver/server');
const knex = appRequire('init/knex').knex;

exports.getServers = (req, res) => {
  knex('server').select().then(success => {
    res.send(success);
  }).catch(err => {
    console.log(err);
    res.status(500).end();
  });
};

exports.getOneServer = (req, res) => {
  const serverId = req.params.serverId;
  let result = null;
  knex('server').select().where({
    id: +serverId,
  }).then(success => {
    if(success.length) {
      result = success[0];
      return manager.send({
        command: 'list',
      }, {
        host: success[0].host,
        port: success[0].port,
        password: success[0].password,
      });
    }
    res.status(404).end();
  }).then(success => {
    result.ports = success;
    res.send(result);
  }).catch(err => {
    console.log(err);
    res.status(500).end();
  });
};

exports.addServer = (req, res) => {
  req.checkBody('name', 'Invalid name').notEmpty();
  req.checkBody('address', 'Invalid address').notEmpty();
  req.checkBody('port', 'Invalid port').isInt({min: 1, max: 65535});
  req.checkBody('password', 'Invalid password').notEmpty();
  req.getValidationResult().then(result => {
    if(result.isEmpty()) {
      const name = req.body.name;
      const address = req.body.address;
      const port = +req.body.port;
      const password = req.body.password;
      return serverManager.add(name, address, port, password);
    }
    console.log(result.array());
    result.throw();
  }).then(success => {
    res.send(success);
  }).catch(err => {
    console.log(err);
    res.status(403).end();
  });
};
