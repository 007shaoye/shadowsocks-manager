var app = global.app;

var admin = require('../controllers/admin');

app.post('/admin/server', admin.addServer);
app.get('/admin/server', admin.getServers);