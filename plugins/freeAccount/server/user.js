'use strict';

const config = appRequire('services/config').all();
const app = appRequire('plugins/freeAccount/index').app;
const knex = appRequire('init/knex').knex;
const manager = appRequire('services/manager');
const email = appRequire('plugins/email/index');
const account = appRequire('plugins/freeAccount/server/account');

const sendEmail = (req, res) => {
  req.checkBody('email', 'Email address error').notEmpty().isEmail();
  var errors = req.validationErrors();
  if (errors) {
    return res.send(errors, 400);
  }
  const emailAddress = req.body.email;
  email.sendCode(emailAddress, 'Free Shadowsocks 验证码', '您的验证码是:')
  .then(s => res.send('success'), e => res.status(403).end());
};

const checkCode = (req, res) => {
  const emailAddress = req.body.email;
  const code = req.body.code;
  email.checkCode(emailAddress, code)
  .then(success => {
    return account.createAccount(emailAddress);
  }).then(success => {
    res.send(success);
  }).catch(error => {
    console.log(error);
    res.status(403).end();
  });
};

const getAccount = (req, res) => {
  const address = req.body.address;
  let accountInfo;
  knex('freeAccount').select().where({address})
  .then(success => {
    if(success.length > 0) {
      accountInfo = success[0];
      return manager.send({command: 'list'});
    } else {
      res.status(403).end();
    }
  }).then(success => {
    const port = success.filter(f => {
      return f.port === accountInfo.port;
    })[0];
    if(!port) {
      res.status(403).end();
    } else {
      accountInfo.host = config.plugins.freeAccount.host;
      accountInfo.password = port.password;
      accountInfo.method = config.plugins.freeAccount.shadowsocks.method;
      res.send(accountInfo);
    }
  }).catch(err => {
    res.status(403).end();
  });
};

const render = (req, res) => {
  return res.render('index', {
    'controllers': [
      '/public/controllers/index.js',
      '/public/controllers/manager.js',
    ],
    'routes': [
      '/public/routes/index.js'
    ]
  });
};

exports.render = render;
exports.sendEmail = sendEmail;
exports.checkCode = checkCode;
exports.getAccount = getAccount;
