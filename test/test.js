var couchapi = require('../lib/couchapi');
couchapi.init('http://localhost:5984');
couchapi.test('info');
// couchapi.test('login', 'Bev', 'Bev');
couchapi.login('Bev', 'Bev').when(
    function (data) {
        couchapi.test('session');
        console.log('succes',data); },
    function (err) { console.log('ERROR', err); }
);

