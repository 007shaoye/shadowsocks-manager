const app = require('../index').app;

app.controller('UserController', ['$scope', '$mdMedia', '$mdSidenav', '$state', '$http',
  ($scope, $mdMedia, $mdSidenav, $state, $http) => {
    console.log('Home');
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
      click: 'user.index'
    }, {
      name: '退出',
      icon: 'settings',
      click: function() {
        $http.post('/api/logout');
        $state.go('home.index');
      },
    }];
    $scope.menuClick = (index) => {
      $mdSidenav('left').close();
      if(typeof $scope.menus[index].click === 'function') {
        $scope.menus[index].click();
      } else {
        $state.go($scope.menus[index].click);
      }
    };
  }
]).controller('UserIndexController', ['$scope',
  ($scope) => {
    console.log('Index');
  }
]);
