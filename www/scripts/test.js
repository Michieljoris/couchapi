//Gather output from this and use it to validate the output again..

var tests = [
    ['info']
    // // ['config'],
    // ,['login', 'root', 'root']
    // ,['log', 200]
    // ,['logout']
    ,['login', 'root', 'root']
    // ,['session']
    // ,['userRemove', 'someUser']
    // ,['userAdd', 'someUser', 'pwd', ['someRole']]
    // // ,['userGet', 'someUser']
    // // ,['userUpdate', 'someUser', { "someProp": "someValue"}]
    // // ,['userRoles', 'someUser']
    // // ,['userRoles', 'someUser', ['role1', 'role2']]
    // // ,['userRoles', 'someUser']
    // ,['userAddRole', 'someUser', 'RoleB']
    // ,['userRemoveRole', 'someUser', 'someRole']
    // ,['userRoles', 'someUser']
    
    // ,['userGet', 'someUser']
    // ,['userGet', 'nonExistingUser']
    // // ['logout', 'root', 'root']
    // ['session'],
    // ,['dbRemove', 'somedatabase']
    // ,['dbCreate', 'somedatabase']
    // ,['dbCompact', 'somedatabase']
    
    // ,"Test dbUse"
    // ,['dbUse', 'somedatabase']
    // ,['dbAll']
    // ,['dbRemove','bla']
    // ,['dbAll']
    // ,['dbCreate']
    
    // ,['dbCompact']
    // ,"dbSecurity"
    ,['dbUse', 'mydatabase']
    // ,['dbCreate']
    // ,['dbSecurity']
    // ,['dbSecurity', {
    //     admins: { names: ['test'], roles: ['roles']}
    //     ,members: { names: ['test'], roles: ['roles']}
    //                 }]
    
    // ,['dbSecurity']
    // ,"dbDesign"
    // ,['dbDesign','couchapi', 'views', 'myview', { map: "function(doc) { emit(null, doc); }" }]
    
    ,['dbDesign','couchapi', 'views', 'myview', "?"]
    // ,['dbDesign','designdoc', null, 'somefunction', "?" ]
    // ,['dbDesign','designdoc', null, 'somefunction', null]
    // ,['dbDesign','designdoc', null, 'somefunction', "?" ]
    // ,['dbDesign','designdoc', 'somegroup', 'somefunction', "function() { return 'hello'; }"]
    // ,['dbDesign','designdoc', 'somegroup', 'somefunction', "?" ]
    // ,['dbFilter', 'mydesign', 'somefilter', "function() { return 'hello'; }"]
    // ,['dbAll']
    // ,['dbConflicts'] //TODO
    
    
    
    // ,['docSave', { _id: "someid", source: "somestring" }]
    // // ,['docUpdate', { _id: "someid", source: "somestring" }]
    // ,['docGet', 'someid']
    // ,['docGet', 'someid']
    // ,['docAllDesign']
    // ,['docAllDesignInclude']
    // ,['docBulkSave', [{_id:"id3", field: 1 }, {_id: "id2", field: 2 }]]
    
    // ,['docCopy', "id3", "copied" ] //not working
    // ,['viewCleanup']
    // ,['viewCompact', 'couchapi']
    
    
    ,"view"
    // ,['viewTemp', function(doc) { emit('temp', doc); } ]
    // ,['viewSet','couchapi', 'view3', function(doc) { emit('bla', doc); } ]
    // ,['view', 'couchapi', 'view3' ] //use query for pouch, does pouch support views other than temporary?
    // ,['viewRemove', 'couchapi', 'view3' ]
    
    ,['docAllInclude']
    
    
    //Still to be implemented and checked
    // ,['uuid']
    // ,['taskActive']
    // ,['replicate']
    // ,['replicateStop']
    // ,['replicationAdd']
    // ,['replicationRemove']
    //,['sync']
    // ,['listView']
    //,['docResolveConflicts', function() { console.log(arguments) }, 'someid']
    //,['docBulkGet', ['someid']] //use query for pouch and view for couch 
    //,['docConflicts', 'someid']
    //,['dbConflicts']
    //,['dbChanges']
    
    ,['dbAll']
];


var conflicts= {
       "map": function(doc) { emit(null, doc); }
   };

function test() {
    var fun = arguments[0];
    return couchapi[fun].apply(couchapi, Array.prototype.slice.call(arguments, 1));
}

function go(tests) {
    var vow = VOW.make();
    var counter = 0;
    function recur() {
        
        if (counter === tests.length) {
            vow.keep();
            return;    
        }
        else {
            var fun = tests[counter++];
            while (typeof fun === 'string') {
                console.log(fun);
                fun = tests[counter++];
            }
            var iter = function (url, cb) {
                couchapi.init(url);
                test.apply(null, fun).when(
                    function(data) {
                        console.log('%c' + fun[0], 'color:blue;font-weight:bold',  ': ', data);
                        if (!url) console.log('--'); 
                        cb();
                    }
                    ,function(err) {
                        console.log('%c' + fun[0], 'color:purple;font-weight:bold',  ': ', err);
                        if (!url) console.log('--'); 
                        cb();
                    }
                );
                
            };
            iter('http://localhost:5984', function() {
                iter('', recur);
            });
        }
        
    }
    recur();
    return vow.promise;
}

console.log('%cTesting couchapi:', 'text-decoration:underline;font-size:15px;color:green;');
console.log('%cCouchDB:', 'font-size:15px;color:green;');
couchapi.init('http://localhost:5984');
go(tests)
    .when(
        function() {
            // console.log('%c\nPouchDB:', 'font-size:15px;color:green;');
            console.log('%c\nDone', 'color:green');
            // couchapi.init();
            // return go(tests);
        })
    .when(
        function() {
            // console.log('%c\nDone', 'color:green');
        }
    );





