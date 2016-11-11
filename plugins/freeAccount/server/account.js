'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('freeAccount');

const knex = appRequire('init/knex').knex;
const manager = appRequire('services/manager');
const flow = appRequire('plugins/flowSaver/flow');
const crypto = require('crypto');
const config = appRequire('services/config').all();
const email = appRequire('plugins/email/index');
const moment = require('moment');

const getRandomPort = async (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  let port;
  let isPortExist = true;
  let number = 0;
  while(isPortExist && number < 20) {
    port = Math.floor(Math.random() * (max - min + 1)) + min;
    isPortExist = (await knex('freeAccount').select().where({port}))[0];
    number++;
  }
  return isPortExist ? Promise.reject('Get Random Port Fail') : port;
};

const limit = async (emailAddress) => {
  const limit = config.plugins.freeAccount.limit;
  const time = {
    day: moment().hour(0).minute(0).second(0).millisecond(0).toDate(),
    week: moment().day(0).hour(0).minute(0).second(0).millisecond(0).toDate(),
    month: moment().date(1).hour(0).minute(0).second(0).millisecond(0).toDate(),
  };
  if(limit.user.day) {
    const count = (await knex('freeAccount').count().where({
      isDisabled: true,
      email: emailAddress,
    }).whereBetween('time', [time.day, Date.now()]))[0]['count(*)'];
    if(count >= limit.user.day) {
      return Promise.reject('out of limit, user.day, ' + count);
    }
  }
  if(limit.user.week) {
    const count = (await knex('freeAccount').count().where({
      isDisabled: true,
      email: emailAddress,
    }).whereBetween('time', [time.week, Date.now()]))[0]['count(*)'];
    if(count >= limit.user.week) {
      return Promise.reject('out of limit, user.week, ' + count);
    }
  }
  if(limit.user.month) {
    const count = (await knex('freeAccount').count().where({
      isDisabled: true,
      email: emailAddress,
    }).whereBetween('time', [time.month, Date.now()]))[0]['count(*)'];
    if(count >= limit.user.month) {
      return Promise.reject('out of limit, user.month, ' + count);
    }
  }
  if(limit.global.day) {
    const count = (await knex('freeAccount').count().where({
      isDisabled: true,
    }).whereBetween('time', [time.day, Date.now()]))[0]['count(*)'];
    if(count >= limit.global.day) {
      return Promise.reject('out of limit, global.day, ' + count);
    }
  }
  if(limit.global.week) {
    const count = (await knex('freeAccount').count().where({
      isDisabled: true,
    }).whereBetween('time', [time.week, Date.now()]))[0]['count(*)'];
    if(count >= limit.global.week) {
      return Promise.reject('out of limit, global.week, ' + count);
    }
  }
  if(limit.global.month) {
    const count = (await knex('freeAccount').count().where({
      isDisabled: true,
    }).whereBetween('time', [time.month, Date.now()]))[0]['count(*)'];
    if(count >= limit.global.month) {
      return Promise.reject('out of limit, global.month, ' + count);
    }
  }
  return;
};

const createAccount = async (emailAddress) => {
  // check if this email has an account,
  // if true, return old account instead of create one.
  const oldAccount = await knex('freeAccount').select().where({email: emailAddress, isDisabled: false});
  if(oldAccount.length > 0) {
    logger.info(`Use old accout: ${ oldAccount[0].address }`);
    return oldAccount[0].address;
  }
  // check if free account out of limit
  await limit(emailAddress);

  // create account
  const min = config.plugins.freeAccount.shadowsocks.startPort;
  const max = config.plugins.freeAccount.shadowsocks.endPort;
  const port = await getRandomPort(min, max);
  const password = crypto.randomBytes(4).toString('hex');
  try {
    await manager.send({
      command: 'add',
      port,
      password,
    });
    const address = crypto.randomBytes(16).toString('hex');
    await knex('freeAccount').insert({
      address,
      email: emailAddress,
      port,
      flow: config.plugins.freeAccount.shadowsocks.flow * 1000 * 1000,
      currentFlow: 0,
      time: Date.now(),
      expired: Date.now() + config.plugins.freeAccount.shadowsocks.time * 60 * 1000,
      isDisabled: false,
    });
    await email.sendMail(emailAddress, 'Free Shadowsocks 账号', 'Shadowsocks 账号创建成功，请访问下列地址查看\nhttp://' + config.plugins.freeAccount.host + ':' + config.plugins.freeAccount.port + '/' + address);
    return address;
  } catch(err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const checkAccount = async () => {
  try {
    const list = await manager.send({
      command: 'list',
    });
    const account = await knex('freeAccount').select().where({
      isDisabled: false
    });
    account.forEach(async f => {
      const myFlow = (await flow.getFlow(f.time, f.expired)).filter(fil => {
        return fil.port === f.port;
      })[0];
      if(myFlow) {
        await knex('freeAccount').where({
          address: f.address,
        }).update({
          currentFlow: myFlow.sumFlow,
        });
      }
      if(Date.now() >= f.expired || f.currentFlow >= f.flow) {
        await knex('freeAccount').where({
          address: f.address,
        }).update({
          isDisabled: true,
        });
        await manager.send({
          command: 'del',
          port: f.port,
        });
      }
    });
  } catch(err) {
    console.log(err);
  }
};

checkAccount();
setInterval(() => {
  checkAccount();
}, 60 * 1000);

exports.createAccount = createAccount;
