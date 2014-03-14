var tests = [
    // ['info'],
    // ['config'],
    ['login', 'root', 'root'],
    ['log'],
    // ['logout', 'root', 'root']
    ['session'],
    ['dbAll'],
    ['login']
];


tests.forEach(function(t) {
    couchapi.init();
    couchapi.test.apply(couchapi, t);
    // couchapi.init('http://localhost:5984');
    // couchapi.test.apply(couchapi, t);
    
});




