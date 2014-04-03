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
    // ,['dbDesign','designdoc', null, 'somefunction', "function() { return 'hello'; }"]
    // ,['dbDesign','designdoc', null, 'somefunction', "?" ]
    // ,['dbDesign','designdoc', null, 'somefunction', null]
    // ,['dbDesign','designdoc', null, 'somefunction', "?" ]
    // ,['dbDesign','designdoc', 'somegroup', 'somefunction', "function() { return 'hello'; }"]
    // ,['dbDesign','designdoc', 'somegroup', 'somefunction', "?" ]
    // ,['dbFilter', 'mydesign', 'somefilter', "function() { return 'hello'; }"]
    // ,['dbAll']
    // ,['dbConflicts'] //TODO
    
    
    // ,['docSave', { _id: "someid", source: "somestring" }]
    ,['docUpdate', { _id: "someid", source: "somestring" }]
    ,['docGet', 'someid']
    ,['docAllDesign']
    ,['docAllDesignInclude']
    ,['docAll']
    ,['dbAll']
];

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





