var tests = [
    ['info']
    ,['config'] 
    ,['login', 'root', 'root']
    ,['login', 'admin', 'admin']
    ,['config']
    ,['log', 200]
    ,['logout']
    ,['config'] 
    ,['session']
    ,['login', 'admin', 'admin']
    ,['session']
  
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
    // ,['dbUse', 'mydatabase']
    // ,['dbCreate']
    // ,['dbSecurity']
    // ,['dbSecurity', {
    //     admins: { names: ['test'], roles: ['roles']}
    //     ,members: { names: ['test'], roles: ['roles']}
    //                 }]
    
    // ,['dbSecurity']
    // ,"dbDesign"
    // ,['dbDesign','couchapi', 'views', 'myview', { map: "function(doc) { emit(null, doc); }" }]
    
    // ,['dbDesign','couchapi', 'views', 'myview', "?"]
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
    
    
    // ,"view"
    // ,['viewTemp', function(doc) { emit('temp', doc); } ]
    // ,['viewSet','couchapi', 'view3', function(doc) { emit('bla', doc); } ]
    // ,['view', 'couchapi', 'view3' ] //use query for pouch, does pouch support views other than temporary?
    // ,['viewRemove', 'couchapi', 'view3' ]
    // ,['uuid']
    // ,['docBulkSave', [{_id:"id1", field: 1 }, {_id: "id2", field: 2 }, {_id: "id3", field: 2 }]]
    
    // ,['docBulkRemove', [{ _id: 'id1' }, {_id: 'id2'}]]
    // ,['uuid']
    
    
    // ,['replicate', 'db1', 'db2', { _id: 'myrep' }]
    // ,['replicationAdd', { _id: 'myrep', source: 'db1', target: 'db2', live: true}]
    // ,"db1"
    // ,['dbUse', 'db1']
    // ,['docSave', { _id: 'db1id'}]
    // ,['docAllInclude']
    // ,"db2"
    // ,['dbUse', 'db2']
    // ,['docAllInclude']
    // ,['replicationRemove',  'myrep' ]
    
    
    // ,['dbUse', '_replicator']
    // ,['docAllInclude']
    
    // ,['taskActive']
    
    
    //Still to be implemented and checked
    //,['docResolveConflicts', function() { console.log(arguments) }, 'someid']
    //,['docConflicts', 'someid']
    //,['dbConflicts']
    // ,['dbAll']
];
  
  
if (typeof module != 'undefined' && module &&
      typeof exports == 'object' && exports && module.exports === exports) {
  module.exports = tests;
}
