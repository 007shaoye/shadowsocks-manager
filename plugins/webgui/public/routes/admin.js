const app = require('../index').app;

app.config(['$stateProvider', $stateProvider => {
  $stateProvider
    .state('admin', {
      url: '/admin',
      abstract: true,
      templateUrl: '/public/views/admin/admin.html',
    })
    .state('admin.index', {
      url: '/index',
      controller: 'AdminIndexController',
      templateUrl: '/public/views/admin/index.html',
    })
    .state('admin.server', {
      url: '/server',
      controller: 'AdminServerController',
      templateUrl: '/public/views/admin/server.html',
    })
    .state('admin.serverPage', {
      url: '/server/:serverId',
      controller: 'AdminServerPageController',
      templateUrl: '/public/views/admin/serverPage.html',
    })
    .state('admin.addServer', {
      url: '/addServer',
      controller: 'AdminAddServerController',
      templateUrl: '/public/views/admin/addServer.html',
    })
    .state('admin.user', {
      url: '/user',
      controller: 'AdminUserController',
      templateUrl: '/public/views/admin/user.html',
    })
    .state('admin.account', {
      url: '/account',
      controller: 'AdminAccountController',
      templateUrl: '/public/views/admin/account.html',
    })
    .state('admin.addAccount', {
      url: '/addAccount',
      controller: 'AdminAddAccountController',
      templateUrl: '/public/views/admin/addAccount.html',
    })
    .state('admin.editAccount', {
      url: '/account/:accountId/edit',
      controller: 'AdminEditAccountController',
      templateUrl: '/public/views/admin/editAccount.html',
    })
    .state('admin.userPage', {
      url: '/user/:userId',
      controller: 'AdminUserPageController',
      templateUrl: '/public/views/admin/userPage.html',
    });
  }])
;
