const app = require('../index').app;

app.controller('MainController', ['$scope', '$localStorage',
  ($scope, $localStorage) => {
    $scope.version = window.ssmgrVersion;
    $localStorage.$default({
      admin: {},
      home: {},
      user: {},
    });
    $scope.mainLoading = true;
    $scope.setMainLoading = status => {
      $scope.mainLoading = status;
    };
    document.addEventListener('visibilitychange', () => {
      $scope.$broadcast('visibilitychange', document.visibilityState);
    });
  }
]);
