// var couchapi = require('../lib/couchapi');
// couchapi.init('http://localhost:5984');
// couchapi.test('info');
// // couchapi.test('login', 'Bev', 'Bev');
// couchapi.login('Bev', 'Bev').when(
//     function (data) {
//         couchapi.test('session');
//         console.log('succes',data); },
//     function (err) { console.log('ERROR', err); }
// );


var Pouch = require('pouchdb');
// console.log(pouch);
// var db = new Pouch('http://127.0.0.1:5984/test');
Pouch('test', function(err, db) {
    console.log('making test', err, db);
    db.info(function(err, doc) {
        console.log('bla', doc, err);
    });
    db.put({ _id: '10', title: 'mytitle' }, function callback(err, result) {
        if (!err) {
            console.log('Successfully posted a todo!');
        }
        console.log('put', err, result);
    });
    db.allDocs({include_docs: true, descending: true}, function(err, doc) {
        console.log('all_docs',doc, err);
    }); 
    db.get('10', function(err, result) {
        console.log('get', err, result);
    });
    
});

function addTodo(text) {
  var todo = {
    _id: new Date().toISOString(),
    title: text,
    completed: false
  };
  db.put(todo, function callback(err, result) {
    if (!err) {
      console.log('Successfully posted a todo!');
    }
  });
}

// addTodo('hello');

function showTodos() {
  db.allDocs({include_docs: true, descending: true}, function(err, doc) {
      console.log(doc, err);
    // redrawTodosUI(doc.rows);
  });
}


// showTodos();
  // db.info(function(err, doc) {
  //     console.log('bla', doc, err);
  // });

// Pouch.allDbs(function (err, response) {
//     console.log(err, response);
//   });
