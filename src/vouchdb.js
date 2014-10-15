//A simple vows based wrapper for vouchdb_couch.js, which is a modified
//jquery.couch.js, the jquery javascript adapter that comes with futon.

// It is mirroring almost all functionality but the functions are returning vows
// instead of expecting success and error callbacks passed in.

// I added a few more utility functions mainly to easily configure and modify
// security objects and design documents.
//
//-------

//Make this script useable in multiple environments
(function (root, factory) {
    
  if (typeof module != 'undefined' && module &&
      typeof exports == 'object' && exports && module.exports === exports) {
        // CommonJS
        
        var DOUGS_VOW = require('dougs_vow');
        module.exports = factory({}, DOUGS_VOW);
        module.exports._couch = require('./vouchdb_couch.js')._couch;
        module.exports._pouch = require('./vouchdb_pouch.js')._pouch;
    } else {
        // Global variable
        root.vouchdb = factory(root.vouchdb || {}, VOW);
    }
}(this, function factory(api, VOW) {
    "use strict";
    //#API
    //##Couchdb
    // 
    //     var api = {
    //     _couch: { ... } //attached by vouchdb_couch.js
    //     _pouch: { .... } //attached by pouch_adapter.js
    //     connect: fn
    //     etc..
    //     };
    
    var dbName;
    var vouch;
        
    //###connect
    //Vouchdb will try use vouchdb_couch if present and url is passed
    //in. Otherwise will fall back to pouch.
    //Sets vouchdb.adapter to either pouch or couch.
    api.connect = function(url) {
        vouch = (api._couch && url) ? api._couch : api._pouch;
        if (!vouch)
            throw new Error('vouchdb can\'t talk to a database. Either load vouchdb_couch or vouchdb_pouch, or both');
        vouch.urlPrefix = url;
        this.adapter = vouch.adapter;
    };
    
    //Probably need to fiddle with the error reporting a bit more to get it
    //working well for all broken vows.
    function vowerify(options) {
        var vow = VOW.make();
        options = options || {};
        options.success = vow.keep;
        options.error = function(status, error, reason) {
            vow.break({
                status: status && status.status ? status.status : status,
                reason: typeof reason === 'string' ?
                    reason : (status && status.reason ? status.reason : error)
            });   
        };
        return { promise: vow.promise, options: options };
    }
        
    //###config
    // View and edit the CouchDB configuration, called with just the options
    // parameter the entire config is returned, you can be more specific by
    // passing the section and option parameters, if you specify a value that
    // value will be stored in the configuration.
    api.config = function(section, option, value) {
        var vowed = vowerify(); 
        if (value === null) value = 'null';
        else if (typeof value !== 'undefined') 
            value = value.toString();
        vouch.config(vowed.options, section, option, value);
        return vowed.promise;
    };
    //###info
    // Accessing the root of a CouchDB instance returns meta information about
    // the instance. The response is a JSON structure containing information
    // about the server, including a welcome message and the version of the
    // server.
    api.info = function(){
        
        var vowed = vowerify();
        vouch.info(vowed.options);
        return vowed.promise;
    }; 
    
    //###log
    //Retrieve the couchdb log
    api.log = function(bytes, offset) {
        var vow = VOW.make();
        vouch.log({
            //never gonna happen.. 
            success: vow.keep,
            //jquery.couch.js tries to parse the result, but it is not a json
            error: function(status, req) {
                //luckily we can check the status and still return the
                //responseText
                if (status === 200) vow.keep(req.responseText);
                else vow.break({ status: status, reason: req});
            },
            bytes:bytes || 1000 , offset:offset || 0
        });
        return vow.promise;
    };
        
    //##Sessions
    //###login
    //Authenticate against the couchdb _users database and create a session
    api.login = function(name, pwd) {
        var vowed = vowerify({
            name: name,
            password: pwd,
            withCredentials:true });
        vouch.login(vowed.options);
        return vowed.promise;
    }; 
    
    //###logout
    //Delete your current CouchDB user session
    api.logout = function() {
        var vowed = vowerify();
        vouch.logout(vowed.options);
        return vowed.promise;
    };

    //###session
    //Returns the session information for the currently logged in user.
    api.session = function() {
        var vowed = vowerify();
        vouch.session(vowed.options);
        return vowed.promise;
    };
    
    //##Users
    //###userAdd
    //Add a user to the `_user` database
    api.userAdd = function(name, pwd) {
        var vowed = vowerify();
        var userDoc = typeof name !== 'string' ? name : { name: name };
        vouch.signup(userDoc, pwd, vowed.options);
        return vowed.promise;
    };
        
    //###userRemove
    //Remove a user from the `_user` database
    api.userRemove = function(name) {
        var vowed = vowerify(); 
        vouch.userDb(function(data, status, error, reason) {
            if (error) vowed.options.error(status, error, reason);
            else { var dbName = data.name;
                   var user_prefix = "org.couchdb.user:";
                   api.docRemove(user_prefix + name, dbName).when(
                       vowed.options.success, vowed.options.error
                   );
                 }
        });
        return vowed.promise;
    };
    
    //###userGet
    //Get user document from `_user` database
    api.userGet = function(name) {
        var vowed = vowerify(); 
        vouch.userDb(function(data, status, error, reason) {
            if (error) vowed.options.error(status, error, reason);
            else vouch.db(data.name).openDoc('org.couchdb.user:' +name, vowed.options);
        });
        return vowed.promise;
    };

    //###userUpdate
    //Update a user document in the `_user` database
    api.userUpdate = function(name, props) {
        var vowed = vowerify(); 
        vouch.userDb(function(data, status, error, reason) {
            if (error) vowed.options.error(status, error, reason);
            else { var dbName = data.name;
                   vouch.db(dbName).openDoc('org.couchdb.user:' + name, {
                       success: function(data) {
                           Object.keys(props).forEach(function(p) {
                               data[p] = props[p]; 
                           });
                           vouch.db(dbName).saveDoc(data, vowed.options);
                       },
                       error: vowed.options.error
                   });
                 }
        });
        return vowed.promise;
    };

    //###userRoles
    //Fetch or set the roles assigned to a user
    api.userRoles = function(name, roles) {
        var vowed = vowerify(); 
        if (roles) {
            api.userUpdate(name, {roles:roles}).when(
                vowed.options.success,
                vowed.options.error
            );
        }
        else api.userGet(name).when(
            function(user) {
                vowed.options.success(user.roles);
            },
            vowed.options.error
        );
        return vowed.promise;
    };
        
    //###userRemoveRole
    //Remove a role from a user
    api.userRemoveRole = function(name, role) {
        var vowed = vowerify(); 
        vouch.userDb(function(data, status, error, reason) {
            if (error) vowed.options.error(status, error, reason);
            else { var dbName = data.name;
                   vouch.db(dbName).openDoc('org.couchdb.user:' + name, {
                       success: function(data) {
                           if (data.roles.indexOf(role) !== -1) {
                               data.roles = data.roles.filter(
                                   function(e){ return e !==role; });
                               vouch.db(dbName).saveDoc(data, vowed.options);
                           }
                           else vowed.options.succes(data);
                        
                       },
                       error: vowed.options.error
                   });
                 }
        });
        return vowed.promise;
    }; 

    //###userAddRole
    //Add a role to a user
    api.userAddRole = function(name, role) {
        var vowed = vowerify(); 
        vouch.userDb(function(data, status, error, reason) {
            if (error) vowed.options.error(status, error, reason);
            else { var dbName = data.name;
                   vouch.db(dbName).openDoc('org.couchdb.user:' + name, {
                       success: function(data) {
                           if (data.roles.indexOf(role) === -1) {
                               data.roles.push(role);
                               vouch.db(dbName).saveDoc(data, vowed.options);
                           }
                           else vowed.options.success(data);
                        
                       },
                       error: vowed.options.error
                   });
                 }
        });
        return vowed.promise;
    }; 
        
    //##Databases
    //###dbAll
    // Returns a list of all the databases in the CouchDB instance
    api.dbAll = function() {
        var vowed = vowerify(); 
        vouch.allDbs(vowed.options);
        return vowed.promise;
    };

    //###dbUse
    
    //Set the default database name, making the name parameter for subsequent
    //database manipulation calls optional
    api.dbUse = function(name) {
        dbName = name;
        return VOW.kept('Using ' + name);
    }; 

    //###dbRemove
    //Remove a database
    api.dbRemove = function(name) {
        var vowed = vowerify(); 
        vouch.db(name || dbName).drop(vowed.options);
        return vowed.promise;
    };

    //###dbCreate
    //Create a new database named *name*
    api.dbCreate = function(name) {
        var vowed = vowerify(); 
        vouch.db(name || dbName).create(vowed.options);
        return vowed.promise;
    }; 
    
    //###dbEnsureExists
    //Ensure passed in db exists and if not creates it.
    api.dbEnsureExists = function(name) {
        var vow = VOW.make();
        api.dbInfo(name)
            .when(
                function(info) {
                    vow.keep(info);
                }
                ,function(err) {
                    if (err.reason === 'no_db_file') {
                        api.dbCreate(name).when(
                            function(data) {
                                vow.keep(data);
                            },
                            function(err) {
                                vow.breek(err);
                            }
                        );
                    }
                    else vow.breek(err);
                }
            );
        return vow.promise;
    };

    //###dbCompact
    //Request compaction of the specified database.
    api.dbCompact = function(name) {
        var vowed = vowerify(); 
        vouch.db(name || dbName).compact(vowed.options);
        return vowed.promise;
    };

    //###dbChanges
    
    //The passed in *callback* will be called with the changes. Call returned
    //function to stop receiving changes.
    api.dbChanges = function(callback, since, options, aDbName) {
        if (typeof options === 'string') {
            aDbName = options; 
            options = {};   
        }
        var changes = vouch.db(aDbName || dbName).changes(since, options);
        changes.onChange(
            callback 
        );
        return changes.stop;
    };
        
    //###dbInfo
    
        // Gets information about the specified database.
    api.dbInfo = function(name) {
        var vowed = vowerify(); 
        vouch.db(name || dbName).info({
            success: function(data) {
                data.uri = vouch.db(name || dbName).uri;
                vowed.options.success(data);
            },
            error: function(status, reason) {
                var data = { status: status };
                    
                if (typeof reason === 'string')
                    data.reason = reason;
                else data.reason = reason.responseText;
                vowed.options.error(data);           
            }
        });
        return vowed.promise;
    };
    
    //###dbExists
    //Alias for sake of ease of use
    api.dbExists = api.dbInfo;
    
    //###dbSecurity
    
    //Set the security object of a database. If only one parameter is passed, or
    //none, the security object for the specified or default database is
    //returned.
    api.dbSecurity = function(securityObj, aDbName) {
        var vowed = vowerify(); 
        if (typeof securityObj === 'object') {
            vouch.db(aDbName || dbName).setDbProperty('_security', securityObj, vowed.options);
                
        }
        else  {
            aDbName = securityObj;
            vouch.db(aDbName || dbName).getDbProperty('_security', vowed.options);
        }
        return vowed.promise;
    };

    //###dbDesign
    //* Set *group* to create object to hold *functionName*
    //* Set *functionString* to null to remove the function from the group
    //* Set *functionString* to ? to get the content of function named *functionName*
    api.dbDesign = function(docName, obj, functionName, functionString, aDbName) {
        aDbName = aDbName || dbName;
        var vowed = vowerify();
        function save(designDoc) {
            if (obj) {
                designDoc[obj] = designDoc[obj] || {};
                if(functionString) designDoc[obj][functionName] = functionString;
                else delete designDoc[obj][functionName];
            }
            else {
                if (functionString) designDoc[functionName] = functionString;   
                else delete designDoc[functionName];
            }
            api.docSave(designDoc, aDbName).when(
                vowed.options.success,
                vowed.options.error
            );
        }
        api.docGet('_design/' + docName, aDbName).when(
            function(designDoc) {
                if (functionString === "?")
                    vowed.options.success(designDoc[obj] ? designDoc[obj][functionName] : designDoc[functionName]);
                else save(designDoc);
            },
            function() {
                if (functionString === '?') vowed.options.error(null, null, functionName  + " doesn't exist");
                else {
                    var designDoc = {
                        _id : '_design/' + docName
                    };
                    save(designDoc);
                }
            }
        );
        return vowed.promise;
            
    };
        
    //###dbFilter
    //Set or get the a filter. 
    api.dbFilter = function(docName, filterName, funStr, aDbName) {
            return api.dbDesign(docName, 'filters', filterName, funStr, aDbName);
    };
    
    var conflictsMap = function(doc) {
        if (doc._conflicts) {
            emit(null, [doc._rev].concat(doc._conflicts));
        }
    };
        
    var conflictsView = {"map" : conflictsMap.toString()};
        
    function checkForConflictsView(aDbName) {
        var vow = VOW.make();
        api.dbDesign('vouchdb', 'views', 'conflicts', "?", aDbName).
            when(
                vow.keep,
                function() {
                    api.dbDesign('vouchdb', 'views', 'conflicts', conflictsView, aDbName).
                        when(
                            vow.keep,
                            vow.break
                        );
                }
            );
        return vow.promise;
    }
        
        function getRevs(ids, aDbName) {
            var vow = VOW.make();
            var getters = {};
            var idVows = [];
            Object.keys(ids).forEach(function(id) {
                getters[id] = [];
                var revs = ids[id]; 
                revs.forEach(function(rev) {
                    getters[id].push(api.docGet(id, { 'rev': rev}, aDbName));
                });
                idVows.push(VOW.every(getters[id]));
            });
            if (idVows.length === 0) vow.keep([]);
            else VOW.every(idVows).when(
                function(data) {
                    var conflicts = {};
                    data.forEach(function(doc) {
                        conflicts[doc[0]._id] = doc;
                    });
                    
                    vow.keep(conflicts);
                },
                vow.break
            );
            return vow.promise;
        }

    //###dbConflicts
    
    //Check for conflicts in a document. If fetchDocs is true not just the ids
    //are returned but also the docs themselves
    api.dbConflicts = function(fetchDocs, aDbName) {
        var vowed = vowerify();
        if (typeof fetchDocs !== 'boolean') {
            aDbName = fetchDocs;   
            fetchDocs = false;
        }
            checkForConflictsView().when(
                function() {
                    return api.view('vouchdb', 'conflicts', aDbName);
                }
            ).when(
                function(data) {
                    var idsWithConflicts = {};
                    data.rows.forEach(function(r){
                        idsWithConflicts[r.id] = r.value; 
                    });
                    if (!fetchDocs) return VOW.kept(idsWithConflicts);
                    else return getRevs(idsWithConflicts, aDbName);
                }).when(
                    vowed.options.success,
                    vowed.options.error
                );
        return vowed.promise;
    };
        
    //##Docs
    //###docGet
    
    //Returns the specified doc from the specified db.The parameter options is
    //optional and can contain key value query params for instance:
    // `{ open_revs: all rev: asdfasf4333 conflicts: true }`
    api.docGet = function(id, options, aDbName) {
        if (typeof options !== 'object') {
            aDbName = options;   
            options = undefined;
        }
        var vowed = vowerify(options); 
        // options.error = function(err) {
        //     vowed.options.error(null, err, "Failed to get document with id " + id ); };
        vouch.db(aDbName || dbName).openDoc(id, vowed.options);
        return vowed.promise;
    };

    //###docConflicts
    //Implemention of [http://wiki.apache.org/couchdb/Replication_and_conflicts](http://wiki.apache.org/couchdb/Replication_and_conflicts)
    //
    //1. GET docid?conflicts=true
    //2. For each member in the _conflicts array:
    //      GET docid?rev=xxx
    //    If any errors occur at this stage, restart from step 1.
    //    (There could be a race where someone else has already resolved this
        //    conflict and deleted that rev)
    //3. Perform application-specific merging
    //4. Write _bulk_docs with an update to the first rev and deletes of
    //    the other revs.
    api.docConflicts = function(id, aDbName) {
        var result = [];
        var vowed = vowerify();
        var retries = 0;
            
        function getRevsVow(revs) {
            var revGetters = [];
            revs.forEach(function(rev) {
                revGetters.push(api.docGet(id, { rev: rev}, aDbName));
            });
            return VOW.every(revGetters);
        }
            
        function getRevs(revs) {
            getRevsVow(revs).when(
                function(data) {
                    vowed.options.success(result.concat(data));
                },
                function(err) {
                    if (retries++ < 5) getRevs(revs);
                    else vowed.options.error(null, err,
                                             "Couldn't find at least one of the conflicting revs of doc with id " + id);
                }
            );
        }
            
        function getRevIds(id) {
            api.docGet(id, { conflicts: true }, aDbName).when(
                function(doc) {
                    var revs = doc._conflicts;
                    delete doc._conflicts;
                    result.push(doc);
                    if (revs) getRevs(revs); 
                    else vowed.options.success(result);
                },
                function(err) {
                    vowed.options.error(null, err,  "Couldn't find doc with id " + id);
                });
        }
            
        getRevIds(id);
        return vowed.promise;
    };

    //###docResolveConflicts
    //Pass in a doc or id you suspect has conflicts.
    //Resolver is called to decide between conflicting revs.
    //If resolver is left out, a promise is returned with the revs to
    //choose from, and a continuing function to call when you've decided
    //which is the winning rev. Pass in its index. Again a promise
    //is returned of good things achieved..
    api.docResolveConflicts = function(doc, resolver, aDbName) {
        var vowed = vowerify();
        if (typeof resolver !== 'function') aDbName = resolver;
        var id = doc.id ? doc.id : doc;
            
        function prepRevs(revs, winningRev) {
            for (var i=0; i<revs.length; i++) {
                if (i !== winningRev) {
                    var r = revs[i];
                    revs[i] = { _id: r._id, _rev: r._rev,  _deleted : true };
                }
            }
        }
            
        api.docConflicts(id, aDbName).when(
            function(revs) {
                if (revs.length === 1) {
                    if (typeof resolver === 'function')
                        vowed.options.success(revs[0]);   
                    else {
                        vowed.options.success({
                            revs: revs,
                            fun: function() { return VOW.kept(); }
                        });
                    }
                }
                else {
                    if (typeof resolver === 'function') {
                        prepRevs(revs, resolver(revs));
                        api.docBulkSave(revs, aDbName).when(
                            function(data) { vowed.options.success(data); },
                            function(data) { vowed.options.error(data); }
                        );
                    }
                    else vowed.options.success(
                        { revs: revs,
                          choose: function(winningRev) {
                              prepRevs(revs, winningRev);
                              return api.docBulkSave(revs, aDbName);
                          }
                        }
                    );
                }
            }, 
            function(err) { vowed.options.error(null, err); }
        );
        return vowed.promise;
    };
        
    //###docRemove
    
    //Remove a document from a database. You either pass in the document's id or
    //the document itself.
    api.docRemove = function(doc, aDbName) {
        if (typeof doc === 'string')
            return api.docRemoveById(doc, aDbName);
        var vowed = vowerify(); 
        
        vouch.db(aDbName || dbName).removeDoc(doc, vowed.options);
        return vowed.promise;
    };
        
    api.docRemoveById = function(id, aDbName) {
        var vowed = vowerify();
        api.docGet(id, aDbName).when(
            function(doc) {
                api.docRemove(doc, aDbName).when(
                    vowed.options.success,
                    vowed.options.error
                );
            },
            vowed.options.error
        );
        return vowed.promise;
    };
    
    api.docBulkGet = function(docs, aDbName) {
        var vowed = vowerify(); 
        vouch.docBulkGet(docs, vowed.options);
        return vowed.promise;
    };
        
    //###docBulkremove
    
    //Remove a set of documents, supply an array of
    //docs, with at a the _id and _rev  properties
    api.docBulkRemove = function(docs, aDbName) {
        var vowed = vowerify(); 
        vouch.db(aDbName || dbName).bulkRemove({"docs": docs }, vowed.options);
        return vowed.promise;
    };
        
    //###docBulkSave
    //Save a list of documents
    api.docBulkSave = function(docs, aDbName) {
        var vowed = vowerify(); 
        vouch.db(aDbName || dbName).bulkSave({"docs": docs }, vowed.options);
        return vowed.promise;
    };

    //###docAllInclude
    
    //Return a list of all docs in a database, including their contents. You can
    // specify an array of keys to fetch.
    api.docAllInclude= function(keys, aDbName) {
        if (typeof keys == 'string') {
            aDbName = keys;   
            keys = null;
        }
        var vowed = vowerify({ "include_docs": true }); 
        if (keys) vowed.options.keys = keys;
        vouch.db(aDbName || dbName).allDocs(vowed.options);
        return vowed.promise;
    };

    //###docAll
    
    //Fetch all the docs in this database, you can specify an array of keys to
    //fetch. No contents
    api.docAll= function(keys, aDbName) {
        if (typeof keys == 'string') {
            aDbName = keys;   
            keys = null;
        }
        var vowed = vowerify(); 
        if (keys) vowed.options.keys = keys;
            vouch.db(aDbName || dbName).allDocs(vowed.options);
        return vowed.promise;
    };
        
    //###docAllDesignInclude
    //Return a list of all design docs in a database, including their contents
    api.docAllDesignInclude = function(aDbName) {
        var vowed = vowerify({ "include_docs": true }); 
        vouch.db(aDbName || dbName).allDesignDocs(vowed.options);
        return vowed.promise;
    };
        
    //###docAllDesign
    //Fetch all the design docs, no contents
    api.docAllDesign= function(aDbName) {
        var vowed = vowerify(); 
        vouch.db(aDbName || dbName).allDesignDocs(vowed.options);
        return vowed.promise;
    };
    
    //###docCopy
    // The COPY command (which is non-standard HTTP) copies an existing
    // document to a new or existing document.
        
    //Not working under cors at least: XMLHttpRequest cannot load
    // http://localhost:5984/b/asdfasf. Method COPY is not allowed
    // by Access-Control-Allow-Methods.
    api.docCopy = function(id, newId, aDbName) {
        var vowed = vowerify(); 
        vouch.db(aDbName || dbName).copyDoc(id, vowed.options, {
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Destination", newId);
            }
        });
        return vowed.promise;
    };

    //###docSave
    //Create a new document in the specified database, using the supplied
    //JSON document structure. If the JSON structure includes the _id
    //field, then the document will be created with the specified document
    //ID. If the _id field is not specified, a new unique ID will be
    //generated.
    api.docSave = function(doc, aDbName) {
        var vowed = vowerify(); 
        vouch.db(aDbName || dbName).saveDoc(doc, vowed.options);
        return vowed.promise;
    };
    
    //###docUpdate
    //Updates a document, overwriting current doc or if it doesn't exist writes
    //a new one.
    api.docUpdate = function(doc, aDbName) {
        var vow = VOW.make();
        api.docGet(doc._id, aDbName).when(
            function(fetchedDoc) {
                doc._rev = fetchedDoc._rev;
                api.docSave(doc, aDbName)
                    .when(
                        vow.keep, vow.breek
                    );
            },
            function(err) {
                api.docSave(doc, aDbName)
                    .when(
                        vow.keep, vow.breek
                    );
                // vowed.options.error(null, err);
            }
        );
        return vow.promise;
    };
        
    //##Views
    //###viewCompact
    
    // Compacts the view indexes associated with the specified design
    // document. You can use this in place of the full database compaction if
    // you know a specific set of view indexes have been affected by a recent
    // database change.
    api.viewCompact = function(designDoc, aDbName) {
        var vowed = vowerify();
        vouch.db(aDbName || dbName).compactView(designDoc, vowed.options);
        return vowed.promise;
    };
        
    //###viewCleanup
    //Cleans up the cached view output on disk for a given view.
    api.viewCleanup = function(aDbName) {
        var vowed = vowerify(); 
        vouch.db(aDbName || dbName).viewCleanup(vowed.options);
        return vowed.promise;
    };
        
    //###view
    // See: [http://wiki.apache.org/couchdb/HTTP_view_API#Querying_Options](http://wiki.apache.org/couchdb/HTTP_view_API#Querying_Options)
    // Executes the specified view-name from the specified design-doc design
    // document, you can specify a list of `keys` in the options
    // object to recieve only those keys.
    api.view = function(designDoc, viewName, options, aDbName) {
        var vowed = vowerify(options); 
        vouch.db(aDbName || dbName).view(designDoc + '/' + viewName ,vowed.options );
        return vowed.promise;
    };
    
    //###Set a `viewName` in `designDoc` to `func`
    api.viewSet = function(designDoc, viewName, func, aDbName) {
        return api.dbDesign(designDoc, 'views', viewName, { map: func.toString() }, aDbName);
    };

    //###Remove a `viewName` in `designDoc`
    api.viewRemove = function(designDoc, viewName, aDbName) {
        return api.dbDesign(designDoc, 'views', viewName, null, aDbName);
    };

    //###viewTemp
    // Creates (and executes) a temporary view based on the view function
    // supplied in the map paramater, either as string or function object.
    api.viewTemp = function(map, aDbName) {
        var vowed = vowerify({ reduce: false }); 
        vouch.db(aDbName || dbName).query(map,"_count", "javascript", vowed.options);
        return vowed.promise;
    };
    
    //##Replications

    //###replicate
    //Convenience function to set up a replication
    api.replicate = function(db1, db2, repOptions) {
        var repDoc = repOptions || {};
        repDoc.source = db1;
        repDoc.target = db2;
        return api.replicationAdd(repDoc);
    };
        
    //###replicationAdd
    //Add a replication to the replicator database. repDoc can have the
    // following keys: "source", "target", "create_target", "continuous",
    // "doc_ids", "filter", "query_params", "user_ctx" , "since", "onChange", "complete"
    api.replicationAdd = function(repDoc) {
        var vowed = vowerify();
        repDoc._id = repDoc._id || api.uuid();
        
        if (repDoc.role)
            repDoc.user_ctx = { "roles": [repDoc.role] };
        vouch.replicate(repDoc, vowed.options);
        return vowed.promise;
    };
        
    //###replicationRemove
    //Remove a replication by removing the document from the replicator databasee
    api.replicationRemove = function(id) {
        return api.docRemove(id, '_replicator');
    }; 
        
    //##Miscellaneous
    //###listView
    // Fetch a _list view output, you can specify a list of
    //keys in the options object to recieve only those keys.
    api.listView = function(designDoc, listName, keys, aDbName) {
        if (typeof keys === 'string') {
            aDbName = keys;
            keys = null;
        }
        var options = { reduce: false };
        if (keys) options.keys = keys;
        var vowed = vowerify(options); 
        vouch.db(aDbName || dbName).list(designDoc + '/' + listName,'all', vowed.options);
        return vowed.promise;
    };

        //###taskActive
    // You can obtain a list of active tasks by using the /_active_tasks URL.
    // The result is a JSON array of the currently running tasks, with each task
    // being described with a single object.
    api.taskActive = function() {
        var vowed = vowerify(); 
        vouch.activeTasks(vowed.options);
        return vowed.promise;
    };
    
    //###withCredentials
    //Boolean flag added to xhr requests to couchdb
    api.withCredentials = function(withCred) {
        vouch.withCredentials(withCred); 
    };
    
    //###uuid
    //Fetch a new UUID. If `batchSize` is defined a number of uuids are fetched
    //at once and cached
    api.uuid = function(batchSize) {
        var vowed = vowerify(); 
        vouch.newUUID(vowed.options, batchSize);
        return vowed.promise;
    };

    //###test
    //Test function for all of the above.
        //
    //Pass in the name of the api function as the first argument, and the
    //arguments for the function as the rest of the arguments. The promise will
    //resolved and result printed out togehter with returned data or error
    api.test = function() {
        var adapter = vouch.adapter;
        var fun = arguments[0];
        api[fun].apply(api, Array.prototype.slice.call(arguments, 1)).
            when( function(data) {
                console.log(adapter + '.' + fun + ': ', data);
            },
                  function(data) {
                      console.log('Fail ' + adapter + '.' + fun + ': ', data);
                  });
        return 'Wait for it...';
    };

    return api;
}));

