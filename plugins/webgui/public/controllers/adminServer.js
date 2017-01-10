const app = require('../index').app;

app.controller('AdminServerController', ['$scope', '$http', '$state', 'moment',
  ($scope, $http, $state, moment) => {
    $scope.setTitle('服务器');
    $http.get('/api/admin/server').then(success => {
      $scope.servers = success.data;
      $scope.servers.forEach(server => {
        server.flow = {};
        $http.get('/api/admin/flow/' + server.id, {
          params: {
            time: [
              moment().hour(0).minute(0).second(0).millisecond(0).toDate().valueOf(),
              moment().toDate().valueOf(),
            ],
          }
        }).then(success => {
          server.flow.today = success.data[0];
        });
        $http.get('/api/admin/flow/' + server.id, {
          params: {
            time: [
              moment().day(0).hour(0).minute(0).second(0).millisecond(0).toDate().valueOf(),
              moment().toDate().valueOf(),
            ],
          }
        }).then(success => {
          server.flow.week = success.data[0];
        });
        $http.get('/api/admin/flow/' + server.id, {
          params: {
            time: [
              moment().date(1).hour(0).minute(0).second(0).millisecond(0).toDate().valueOf(),
              moment().toDate().valueOf(),
            ],
          }
        }).then(success => {
          server.flow.month = success.data[0];
        });
        $http.get('/api/admin/flow/' + server.id, {
          params: {
            type: 'hour',
          }
        }).then(success => {
          const scaleLabel = (number) => {
            if(number < 1) {
              return number.toFixed(1) +' B';
            } else if (number < 1000) {
              return number.toFixed(0) +' B';
            } else if (number < 1000000) {
              return (number/1000).toFixed(0) +' KB';
            } else if (number < 1000000000) {
              return (number/1000000).toFixed(0) +' MB';
            } else if (number < 1000000000000) {
              return (number/1000000000).toFixed(1) +' GB';
            } else {
              return number;
            }
          };
          server.chart = {
            data: [success.data],
            labels: ['0', '', '', '15', '', '', '30', '', '', '45', '', ''],
            // labels: ['0', '', '', '', '', '', '6', '', '', '', '', '', '12', '', '', '', '', '', '18', '', '', '', '', '', ],
            series: 'day',
            datasetOverride: [{ yAxisID: 'y-axis-1' }],
            options: {
              tooltips: {
                callbacks: {
                  label: function(tooltipItem) {
                    return scaleLabel(tooltipItem.yLabel);
                  }
                }
              },
              scales: {
                yAxes: [
                  {
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                      callback: scaleLabel,
                    },
                  }
                ]
              }
            },
          };
        });
      });
    });
    $scope.toServerPage = (serverId) => {
      $state.go('admin.serverPage', { serverId });
    };
    $scope.setFabButton(() => {
      $state.go('admin.addServer');
    });
  }
])
.controller('AdminServerPageController', ['$scope', '$state', '$stateParams', '$http',
  ($scope, $state, $stateParams, $http) => {
    $scope.setTitle('服务器');
    $scope.setMenuButton('arrow_back', function() {
      $state.go('admin.server');
    });
    $http.get('/api/admin/server/' + $stateParams.serverId).then(success => {
      $scope.server = success.data;
      $scope.setTitle(`服务器 > ${ $scope.server.name }`);
    });
    $scope.editServer = id => {
      $state.go('admin.editServer', { serverId: id });
    };
  }
])
.controller('AdminAddServerController', ['$scope', '$state', '$stateParams', '$http',
  ($scope, $state, $stateParams, $http) => {
    $scope.setTitle('新增服务器');
    $scope.setMenuButton('arrow_back', function() {
      $state.go('admin.server');
    });
    $scope.methods = ['aes-256-cfb', 'aes-192-cfb'];
    $scope.server = {};
    $scope.confirm = () => {
      $http.post('/api/admin/server', {
        name: $scope.server.name,
        address: $scope.server.address,
        port: +$scope.server.port,
        password: $scope.server.password,
        method: success.data.method || 'aes-256-cfb',
      }).then(success => {
        $state.go('admin.server');
      });
    };
    $scope.cancel = () => {
      $state.go('admin.server');
    };
  }
])
.controller('AdminEditServerController', ['$scope', '$state', '$stateParams', '$http',
  ($scope, $state, $stateParams, $http) => {
    $scope.setTitle('编辑服务器');
    $scope.setMenuButton('arrow_back', function() {
      $state.go('admin.serverPage', { serverId: $stateParams.serverId });
    });
    $scope.methods = ['aes-256-cfb', 'aes-192-cfb'];
    $http.get('/api/admin/server/' + $stateParams.serverId).then(success => {
      $scope.setTitle('编辑服务器 > ' + success.data.name);
      $scope.server = {
        name: success.data.name,
        address: success.data.host,
        port: +success.data.port,
        password: success.data.password,
        method: success.data.method || 'aes-256-cfb',
      };
    });
    $scope.confirm = () => {
      $http.put('/api/admin/server/' + $stateParams.serverId, {
        name: $scope.server.name,
        address: $scope.server.address,
        port: +$scope.server.port,
        password: $scope.server.password,
        method: $scope.server.method,
      }).then(success => {
        $state.go('admin.serverPage', { serverId: $stateParams.serverId });
      });
    };
    $scope.cancel = () => {
      $state.go('admin.serverPage', { serverId: $stateParams.serverId });
    };
  }
]);
