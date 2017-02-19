const app = require('../index').app;

app.factory('userApi', ['$q', '$http', ($q, $http) => {
  const getUserAccount = () => {
    let account = null;
    let servers = null;
    return $q.all([
      $http.get('/api/user/account'),
      $http.get('/api/user/server'),
    ]).then(success => {
      return {
        account: success[0].data,
        servers: success[1].data,
      };
    });
  };
  const changePassword = (accountId, password) => {
    return $http.put(`/api/user/${ accountId }/password`, {
      password,
    });
  };
  const updateAccount = account => {
    if(!account.length) {
      $http.get('/api/user/account').then(success => {
        success.data.forEach(a => {
          account.push(a);
        });
      });
    } else {
      account.forEach((a, index) => {
        $http.get('/api/user/account/' + a.id).then(success => {
          if(!success.data.id) {
            account.splice(index, 1);
            return;
          }
          a.password = success.data.password;
          a.data = success.data.data;
          a.type = success.data.type;
        });
      });
    }
  };
  const getServerPortData = (account, serverId, port) => {
    const Promises = [
      $http.get(`/api/user/flow/${ serverId }/${ port }/lastConnect`),
    ];
    if(account.type >= 2 && account.type <= 5) {
      Promises.push(
        $http.get(`/api/user/flow/${ serverId }/${ port }`)
      );
    }
    return $q.all(Promises).then(success => {
      return {
        lastConnect: success[0].data.lastConnect,
        flow: success[1] ? success[1].data[0] : null,
      };
    });
  };
  return {
    getServerPortData,
    getUserAccount,
    changePassword,
    updateAccount,
  };
}]);
