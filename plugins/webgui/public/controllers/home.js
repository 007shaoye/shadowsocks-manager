const app = require('../index').app;

app.controller('HomeController', ['$scope', '$mdMedia', '$mdSidenav', '$state', '$http',
    ($scope, $mdMedia, $mdSidenav, $state, $http) => {
      $http.get('/api/home/login').then(success => {
        if (success.data.status === 'normal') {
          $state.go('user.index');
        } else if (success.data.status === 'admin') {
          $state.go('admin.index');
        }
      });
      $scope.innerSideNav = true;
      $scope.menuButton = function() {
        if ($mdMedia('gt-sm')) {
          $scope.innerSideNav = !$scope.innerSideNav;
        } else {
          $mdSidenav('left').toggle();
        }
      };
      $scope.menus = [{
        name: '首页',
        icon: 'home',
        click: 'home.index'
      }, {
        name: '登录',
        icon: 'cloud',
        click: 'home.login'
      }, {
        name: '注册',
        icon: 'face',
        click: 'home.signup'
      }];
      $scope.menuClick = (index) => {
        $mdSidenav('left').close();
        $state.go($scope.menus[index].click);
      };
    }
  ])
  .controller('HomeIndexController', ['$scope',
    ($scope) => {

    }
  ])
  .controller('HomeLoginController', ['$scope', '$http', '$state', 'homeApi', 'alertDialog',
    ($scope, $http, $state, homeApi, alertDialog) => {
      $scope.user = {};
      $scope.login = () => {
        alertDialog.loading();
        homeApi.userLogin($scope.user.email, $scope.user.password)
        .then(success => {
          alertDialog.close();
          if (success === 'normal') {
            $state.go('user.index');
          } else if (success === 'admin') {
            $state.go('admin.index');
          }
        }).catch(err => {
          alertDialog.show(err, '确定');
        });
      };
      $scope.findPassword = () => {
        alertDialog.loading();
        homeApi.findPassword($scope.user.email).then(success => {
          alertDialog.show(success, '确定');
        }).catch(err => {
          alertDialog.show(err, '确定');
        });
      };
    }
  ])
  .controller('HomeSignupController', ['$scope', '$http', '$state', '$interval', '$timeout', 'alertDialog',
    ($scope, $http, $state, $interval, $timeout, alertDialog) => {
      $scope.user = {};
      $scope.sendCodeTime = 0;
      $scope.sendCode = () => {
        alertDialog.loading();
        $http.post('/api/home/code', {
          email: $scope.user.email,
        }).then(success => {
          alertDialog.show('验证码已发至邮箱', '确定');
          $scope.sendCodeTime = 120;
          const interval = $interval(() => {
            if ($scope.sendCodeTime > 0) {
              $scope.sendCodeTime--;
            } else {
              $interval.cancel(interval);
              $scope.sendCodeTime = 0;
            }
          }, 1000);
        }).catch(err => {
          alertDialog.show('验证码发送错误', '确定');
        });
      };
      $scope.signup = () => {
        alertDialog.loading();
        $http.post('/api/home/signup', {
          email: $scope.user.email,
          code: $scope.user.code,
          password: $scope.user.password,
        }).then(success => {
          return alertDialog.show('用户注册成功', '确定');
        }).then(() => {
          $state.go('home.login');
        }).catch(err => {
          alertDialog.show('用户注册失败', '确定');
        });
      };
    }
  ])
  .controller('HomeResetPasswordController', ['$scope', '$http', '$state', '$stateParams', 'alertDialog',
    ($scope, $http, $state, $stateParams, alertDialog) => {
      $scope.user = {};
      const token = $stateParams.token;
      alertDialog.loading();
      $http.get('/api/home/password/reset', {
        params: {
          token
        },
      }).then(success => {
        alertDialog.close();
      }).catch(err => {
        alertDialog.show('该链接已经失效', '确定').then(() => {
          $state.go('home.index');
        });
      });
      $scope.resetPassword = () => {
        alertDialog.loading();
        $http.post('/api/home/password/reset', {
          token,
          password: $scope.user.password,
        }).then(() => {
          alertDialog.show('修改密码成功', '确定').then(() => {
            $state.go('home.login');
          });
        }).catch(() => {
          alertDialog.show('修改密码失败', '确定');
        });
      };
    }
  ]);
