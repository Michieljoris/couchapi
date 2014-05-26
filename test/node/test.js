var jquery = require ('jQuery');

var VOW = require('../../src/vow');
var vouchdb = require('../../src/vouchdb');
  
vouchdb.connect('http://localhost:5984');
// vouchdb.connect();
   
// console.log(vouchdb);

console.log('Adapter:', vouchdb.adapter);
// vouchdb

vouchdb.dbAll().when(
    function(data) {
        console.log(data);
    }
    ,function(err) {
        console.log(err);
    }
);



var changes = vouchdb.dbChanges(function(data) { console.log(data); } ,0, 'postoffice');
console.log(changes);
