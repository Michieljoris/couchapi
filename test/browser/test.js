//Gather output from this and use it to validate the output again..
//Set options to have pouchdb emulate couchdb as much as possible, so same responses

//Test separately:
    // ,['dbChanges'], continuous replication

function writeFn(a) {
    var s = JSON.stringify(a.slice(1));
    return a[0] + '(' + s.slice(1,s.length-1) + ')';
}

var conflicts= {
       "map": function(doc) { emit(null, doc); }
   };

function test() {
    var fun = arguments[0];
    return vouchdb[fun].apply(vouchdb, Array.prototype.slice.call(arguments, 1));
}

function go(tests, expect, couchUrl) {
    var vow = VOW.make();
    var counter = 0;
    var results = { pouchdb: {} };
    results[couchUrl] = {};
    function recur() {
        
        if (counter === tests.length) {
            vow.keep(results);
            return;    
        }
        else {
            var fun = tests[counter++];
            while (typeof fun === 'string') {
                console.log(fun);
                fun = tests[counter++];
            }
            var iter = function (url, cb) {
                vouchdb.connect(url);
                test.apply(null, fun).when(
                    function(data) {
                        console.log('%c'+ (url ? 'couch:' : 'pouch:') + writeFn(fun),
                                    'text-decoration:underline;color:green',  ': ', data);
                        var id = url ? couchUrl : 'pouchdb';
                        results[id][writeFn(fun)] = data;
                        if (!url) console.log('--'); 
                        cb();
                    }
                    ,function(err) {
                        
                        console.log('%c'+ (url ? 'couch:' : 'pouch:') + writeFn(fun),
                                    'text-decoration:underline;color:green',  ': ', err);
                        results[url ? couchUrl : 'pouchdb'][writeFn(fun)] = err;
                        if (!url) console.log('--'); 
                        cb();
                    }
                );
                
            };
            iter(couchUrl, function() {
                iter('', recur);
            });
        }
        
    }
    recur();
    return vow.promise;
}

console.log('%cTesting vouchdb:', 'text-decoration:underline;font-size:15px;color:green;');
var writeExpect = true;

go(tests, expect, 'http://localhost:5984')
    .when(
        function(result) {
            // console.log('%c\nPouchDB:', 'font-size:15px;color:green;');
            // console.log('%c\nDone', 'color:green');
            // console.log(JSON.stringify(result, null, ' '));
            document.write('<pre>var expect = ' + JSON.stringify(result, null, ' ')
                           + ';</pre');
            var diff = DeepDiff(expect, result);
            if (!diff) console.log("%cAll is OKOKOKOKOKOKOKOKOKOKOKOKOKOK", 'color:green;font-weight:bold');
            else console.log('%cFailed tests:\n' + JSON.stringify(DeepDiff(expect, result), null, ' ') ,
                             'color:red;font-weight:bold'
                            );
            // couchapi.init();
            // return go(tests);
        })
    .when(
        function() {
            // console.log('%c\nDone', 'color:green');
        }
    );





