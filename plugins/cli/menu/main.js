'use strict';

console.log('GGG');

const inquirer = require('inquirer');
const listPort = appRequire('plugins/cli/menu/listPort');

const main = [
  {
    type: 'list',
    name: 'mainMeun',
    message: 'What do you need?',
    choices: ['add port', 'list port', 'exit'],
    // filter: function(val) {
    //   return val.toLowerCase();
    // }
  }
];

inquirer.prompt(main).then().catch();
