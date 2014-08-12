//Gather output from this and use it to validate the output again..
//Set options to have pouchdb emulate couchdb as much as possible, so same responses

//Test separately:
// ,['dbChanges'], continuous replication
// (function (root, test) {
//     console.log('------------');
// })(this, (function(inNode) {
(function() {
    var compare = false;
    // var url = 'http://admin:admin@localhost:5984';
    var url = 'http://localhost:5984';
    var lines = 5;

    var inNode;

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

    var bla = {};
    function processTests() {
        bla = {};
        var last;
        tests = tests.filter(function(test) {
            if (!test.constructor.name === 'Array') {
                bla[writeFn(last)] = test;
                return false;
            }
            last = test;
            return true;
        });
    }

    function go(tests, expect, couchUrl) {
        printWithColor(url, 'blue', '');
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
                    // console.log(fun);
                    fun = tests[counter++];
                }
                var iter = function (url, cb) {
                    vouchdb.connect(url);
                    test.apply(null, fun).when(
                        function(data) {
                            // console.log('%c'+ (url ? 'couch:' : 'pouch:') + writeFn(fun),
                            //             'text-decoration:underline;color:green',  ': ', data);
                            print((url ? 'couch:' : 'pouch:') + writeFn(fun), data);
                            var id = url ? couchUrl : 'pouchdb';
                            results[id][writeFn(fun)] = data;
                            if (!url) console.log('--');
                            cb();
                        }
                        ,function(err) {

                            print((url ? 'couch:' : 'pouch:') + writeFn(fun), err);
                            // console.log('%c'+ (url ? 'couch:' : 'pouch:') + writeFn(fun),
                            //             'text-decoration:underline;color:green',  ': ', err);
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

    if (typeof module != 'undefined' && module &&
        typeof exports == 'object' && exports && module.exports === exports) {
        tests = require('./tests');
        expect = require('./expect');
        VOW = require('dougs_vow');
        vouchdb = require('./vouchdb');
        DeepDiff = require('deep-diff');
        require('colors');
        util = require('util');
        inNode = true;
    };

    function printWithColor(str, color, str2) {
        if (inNode) {
            str = [str[color],
                   util.inspect(str2, { depth:10, colors:false }).split('\n').slice(0, lines)
                   // str2 ? str2.toString() : ''
                   ];
        }
        else {
            str = ['%c' + str , 'color:' + color + ';', str2 || ''];
        }
        console.log.apply(console, str);

    }

    function print(test, result) {
        printWithColor(test, 'green', result);
    }


    go(tests, expect, url)
        .when(
            function(result) {
                // console.log('%c\nPouchDB:', 'font-size:15px;color:green;');
                // console.log('%c\nDone', 'color:green');
                // console.log(JSON.stringify(result, null, ' '));
                if (!inNode)
                    document.write('<pre>var expect = ' + JSON.stringify(result, null, ' ')
                                   + ';</pre');
                var diff = DeepDiff(expect, result);
                // if (!compare) console.log('%cNot comparing....', 'color:red');
                if (!compare) printWithColor('Not comparing....', 'red');
                else if (!diff) console.log("All is OKOKOKOKOKOKOKOKOKOKOKOKOKOK", 'green;');
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

})();
