function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const knex = appRequire('init/knex').knex;
const serverManager = appRequire('plugins/flowSaver/server');
const flow = appRequire('plugins/flowSaver/flow');
const manager = appRequire('services/manager');
const moment = require('moment');

let messages = [];

setInterval(() => {
  if (!messages.length) {
    return;
  }
  messages.forEach(message => {
    console.log(message);
    manager.send(message[0], message[1]).then().catch();
  });
  messages = [];
}, 10 * 1000);

const addPort = (data, server) => {
  messages.push([{
    command: 'add',
    port: data.port,
    password: data.password
  }, {
    host: server.host,
    port: server.port,
    password: server.password
  }]);
};

const delPort = (data, server) => {
  messages.push([{
    command: 'del',
    port: data.port
  }, {
    host: server.host,
    port: server.port,
    password: server.password
  }]);
};

const checkFlow = (() => {
  var _ref = _asyncToGenerator(function* (server, port, startTime, endTime) {
    const flow = yield knex('saveFlow').sum('flow as sumFlow').groupBy('port').select(['port']).where({ id: server, port }).whereBetween('time', [startTime, endTime]);
    return flow[0] ? flow[0].sumFlow : 0;
  });

  return function checkFlow(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

const checkServer = (() => {
  var _ref2 = _asyncToGenerator(function* () {
    const account = yield knex('account_plugin').select();
    const server = yield serverManager.list();
    account.exist = function (number) {
      return !!account.filter(function (f) {
        return f.port === number;
      })[0];
    };
    server.forEach((() => {
      var _ref3 = _asyncToGenerator(function* (s) {
        const port = yield manager.send({ command: 'list' }, {
          host: s.host,
          port: s.port,
          password: s.password
        });
        port.exist = function (number) {
          return !!port.filter(function (f) {
            return f.port === number;
          })[0];
        };
        account.forEach((() => {
          var _ref4 = _asyncToGenerator(function* (a) {
            if (a.type >= 2 && a.type <= 5) {
              let timePeriod = 0;
              if (a.type === 2) {
                timePeriod = 7 * 86400 * 1000;
              }
              if (a.type === 3) {
                timePeriod = 30 * 86400 * 1000;
              }
              if (a.type === 4) {
                timePeriod = 1 * 86400 * 1000;
              }
              if (a.type === 5) {
                timePeriod = 3600 * 1000;
              }
              const data = JSON.parse(a.data);
              let startTime = data.create;
              while (startTime + timePeriod <= Date.now()) {
                startTime += timePeriod;
              }
              const flow = yield checkFlow(s.id, a.port, startTime, Date.now());
              // console.log(s.host + ':' + a.port + ' ' + data.flow + ', ' + flow + (flow >= data.flow ? ' *' : ''));
              if (flow >= data.flow) {
                port.exist(a.port) && delPort(a, s);
                return;
              } else if (data.create + data.limit * timePeriod <= Date.now()) {
                port.exist(a.port) && delPort(a, s);
                return;
              } else if (!port.exist(a.port)) {
                addPort(a, s);
                return;
              }
            } else if (a.type === 1) {
              if (port.exist(a.port)) {
                return;
              }
              addPort(a, s);
              return;
            }
          });

          return function (_x6) {
            return _ref4.apply(this, arguments);
          };
        })());
        port.forEach((() => {
          var _ref5 = _asyncToGenerator(function* (p) {
            if (!account.exist(p.port)) {
              delPort(p, s);
              return;
            }
          });

          return function (_x7) {
            return _ref5.apply(this, arguments);
          };
        })());
      });

      return function (_x5) {
        return _ref3.apply(this, arguments);
      };
    })());
  });

  return function checkServer() {
    return _ref2.apply(this, arguments);
  };
})();

exports.checkServer = checkServer;

checkServer();
setInterval(() => {
  checkServer();
}, 60 * 1000);