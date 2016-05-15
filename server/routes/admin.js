var app = global.app;

var admin = require('../controllers/admin');
var auth = require('../controllers/auth');

app.post('/admin/server', auth.isAdmin, admin.addServer);
app.get('/admin/server', auth.isAdmin, admin.getServers);
app.put('/admin/server', auth.isAdmin, admin.editServer);
app.delete('/admin/server', auth.isAdmin, admin.deleteServer);

app.post('/admin/account', auth.isAdmin, admin.addAccount);
app.delete('/admin/account', auth.isAdmin, admin.deleteAccount);

app.get('/admin/flow',
    auth.isAdmin,
    admin.getFlow
);