const app = require('../index').app;

app
  .controller('MainController', ['$scope', '$http', '$state', '$mdDialog', '$interval',
    function($scope, $http, $state, $mdDialog, $interval) {
      $scope.interval = null;
      $scope.setInterval = interval => {
        $scope.interval = interval;
      };
      $scope.showAlert = function(title, text) {
        $mdDialog.show(
          $mdDialog.alert()
          .parent(angular.element(document.querySelector('#popupContainer')))
          .clickOutsideToClose(true)
          .title(title)
          .textContent(text)
          .ariaLabel('alert')
          .ok('确定')
        );
      };
      $scope.isLoading = false;
      $scope.loading = isLoading => {
        $scope.isLoading = isLoading;
      };
      $scope.back = function() {
        $state.go('index');
      };
      $scope.title = '';
      $scope.setTitle = function(title) {
        $scope.title = title;
      };
      $scope.setBackButton = function(fn) {
        $scope.back = fn;
      };
      $scope.menus = [];
      $scope.setMenu = function(menus) {
        $scope.menus = menus;
      };
      $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        if ($scope.interval) {
          $interval.cancel($scope.interval);
        }
        $scope.title = '';
        $scope.back = function() {
          $state.go('index');
        };
        $scope.menus = [];
      });
    }
  ])
  .controller('IndexController', ['$scope', '$http', '$state', '$timeout',
    ($scope, $http, $state, $timeout) => {
      $scope.setTitle('Free Shadowsocks');
      var menu = () => {
        $scope.setMenu([{
          icon: 'settings',
          text: '管理',
          click: function() {
            $http.post('/config').then(function() {
              $state.go('manager');
            }).catch(function() {
              $state.go('password');
            });
          }
        }, {
          icon: 'info_outline',
          text: '关于',
          click: function() {
            $state.go('about');
          }
        }]);
      };
      $timeout(() => {
        menu();
      }, 250);
      $scope.user = {};
      $scope.sendCode = () => {
        $scope.loading(true);
        $http.post('/email', {
          email: $scope.user.email
        }).then(function(success) {
          $scope.loading(false);
          $scope.showAlert('提示', '验证码发送成功。');
        }).catch(function(error) {
          $scope.loading(false);
          $scope.showAlert('错误', '验证码发送失败。');
        });
      };
      $scope.checkCode = function() {
        $scope.loading(true);
        $http.post('/code', {
          email: $scope.user.email,
          code: ('000000' + $scope.user.code).substr(-6),
        }).then(function(success) {
          // $scope.loading(false);
          $state.go('account', {
            id: success.data
          });
        }).catch(function(error) {
          $scope.loading(false);
          if (error.data.startsWith('out of limit, ')) {
            var type = error.data.split(',')[1].split('.')[0].trim();
            var time = error.data.split(',')[1].split('.')[1].trim();
            if (type === 'user') {
              if (time === 'day') {
                return $scope.showAlert('错误', '该邮箱本日申请次数超过限额。');
              }
              if (time === 'week') {
                return $scope.showAlert('错误', '该邮箱本周申请次数超过限额。');
              }
              if (time === 'month') {
                return $scope.showAlert('错误', '该邮箱本月申请次数超过限额。');
              }
            }
            if (type === 'global') {
              if (time === 'day') {
                return $scope.showAlert('错误', '本日免费帐号申请次数已达上限。');
              }
              if (time === 'week') {
                return $scope.showAlert('错误', '本周免费帐号申请次数已达上限。');
              }
              if (time === 'month') {
                return $scope.showAlert('错误', '本月免费帐号申请次数已达上限。');
              }
            }
          }
          $scope.showAlert('错误', '验证失败。');
        });
      };
      $scope.emailKeypress = function(e) {
        if (e.keyCode === 13 && $scope.user.email) {
          $scope.sendCode();
        }
      };
      $scope.codeKeypress = function(e) {
        if (e.keyCode === 13 && $scope.user.code) {
          $scope.checkCode();
        }
      };
      $scope.manager = function() {
        $http.post('/config').then(function() {
          $state.go('manager');
        }).catch(function() {
          $state.go('password');
        });
      };
      $scope.about = function() {
        $state.go('about');
      };
    }
  ])
  .controller('AccountController', ['$scope', '$http', '$state', '$stateParams', '$interval',
    ($scope, $http, $state, $stateParams, $interval) => {
      $scope.qrcode = '';
      var b64EncodeUnicode = function(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
          return String.fromCharCode('0x' + p1);
        }));
      };
      $scope.getAccount = function() {
        $scope.qrcode || $scope.loading(true);
        $http.post('/account', {
          address: $stateParams.id
        }).then(function(success) {
          $scope.loading(false);
          $scope.accountInfo = success.data;
          $scope.qrcode = 'ss://' + b64EncodeUnicode($scope.accountInfo.method + ':' + $scope.accountInfo.password + '@' + $scope.accountInfo.host + ':' + $scope.accountInfo.port);
        }, function(error) {
          $scope.loading(false);
          // interval && $interval.cancel(interval);
          $state.go('index');
        });
      };
      $scope.getAccount();
      var interval = $interval(function() {
        $scope.getAccount();
      }, 60 * 1000);
      $scope.setInterval(interval);
    }
  ])
  .controller('AboutController', ['$scope', '$http', '$state', ($scope, $http, $state) => {}]);
