const fs = require('fs');
const os = require('os');
const path = require('path');
const logPath = path.resolve(os.homedir() + '/.ssmgr/logs');

const appenders = [{
  type: 'console',
  category: 'system'
}, {
  type: 'console',
  category: 'email'
}, {
  type: 'console',
  category: 'telegram'
}, {
  type: 'console',
  category: 'freeAccount'
}, {
  type: 'console',
  category: 'webgui'
}, {
  type: 'console',
  category: 'alipay'
}];

const log4js = require('log4js');
log4js.configure({
  appenders
});

const setFileAppenders = filename => {
  try {
    fs.statSync(logPath);
  } catch (err) {
    fs.mkdirSync(logPath);
  }
  try {
    fs.statSync(path.resolve(logPath, filename));
  } catch (err) {
    fs.mkdirSync(path.resolve(logPath, filename));
  }
  log4js.loadAppender('dateFile');
  appenders.forEach(appender => {
    log4js.addAppender(log4js.appenderMakers['dateFile']({
      type: 'dateFile',
      filename: path.resolve(logPath, filename + '/' + appender.category + '.log'),
      pattern: '-yyyy-MM-dd'
    }), appender.category);
  });
};

exports.setFileAppenders = setFileAppenders;