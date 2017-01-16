'use strict';

const knex = appRequire('init/knex').knex;
const crypto = require('crypto');

const checkExist = async (obj) => {
  const user = await knex('user').select().where(obj);
  if(user.length === 0) {
    return;
  } else {
    return Promise.reject();
  }
};

const md5 = function(text) {
  return crypto.createHash('md5').update(text).digest('hex');
};

const createPassword = function(password, username) {
  return md5(password + username);
};

const addUser = async (options) => {
  try {
    const insert = {};
    if(options.username) {
      await checkExist({username: options.username});
      Object.assign(insert, {username: options.username});
    }
    if(options.email) {
      await checkExist({email: options.email});
      Object.assign(insert, {email: options.email});
    }
    if(options.telegram) {
      await checkExist({telegram: options.telegram});
      Object.assign(insert, {telegram: options.telegram});
    }
    Object.assign(insert, {
      type: options.type,
      createTime: Date.now()
    });
    if(options.username && options.password) {
      Object.assign(insert, {
        password: createPassword(options.password, options.username)
      });
    }
    return knex('user').insert(insert);
  } catch(err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const checkPassword = async (username, password) => {
  try {
    const user = await knex('user').select(['id', 'type', 'username', 'password']).where({
      username,
    });
    if(user.length === 0) {
      return Promise.reject();
    }
    if(createPassword(password, username) === user[0].password) {
      return knex('user').update({
        lastLogin: Date.now(),
      }).where({
        username,
      }).then(success => {
        return user[0];
      });
    } else {
      return Promise.reject();
    }
  } catch(err) {
    return Promise.reject(err);
  }
};

const editUser = async (userInfo, edit) => {
  try {
    const username = (await knex('user').select().where(userInfo))[0].username;
    if(!username) {
      throw new Error('user not found');
    }
    if(edit.password) {
      edit.password = createPassword(edit.password, username);
    }
    const user = await knex('user').update(edit).where(userInfo);
    return;
  } catch(err) {
    return Promise.reject(err);
  }
};

const getUsers = async () => {
  const users = await knex('user').select().where({
    type: 'normal',
  });
  return users;
};

const getOneUser = async (id) => {
  const user = await knex('user').select().where({
    type: 'normal',
    id,
  });
  if(!user.length) {
    return Promise.reject('User not found');
  }
  return user[0];
};

exports.add = addUser;
exports.edit = editUser;
exports.checkPassword = checkPassword;
exports.get = getUsers;
exports.getOne = getOneUser;
