const app = require('../index').app;

app.factory('adminApi', ['$http', $http => {
  const getUser = () => {
    return $http.get('/api/admin/user').then(success => success.data);
  };
  return {
    getUser,
  };
}]);
