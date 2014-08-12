(function (root, factory) {
  if (typeof module != 'undefined' && module &&
      typeof exports == 'object' && exports && module.exports === exports) {
        // CommonJS
        module.exports = factory({}, require('pouchdb'));
    } else {
        // Global variable
        root.vouchdb = factory(root.vouchdb || {}, PouchDB);
    }
})(this, function(api, PouchDB) { 
    function notApplicable(options, msg) {
	// console.log('notApplicable', options);
	options.error(418, null, msg || 'Not applicable to PouchDB');
    }
    
    function notImplemented(options) {
	options.error(null, null, 'Not implemented yet');
    }
    //TODO add some flag that puts this adapter in emulation mode instead of returning 418's.
    //Per function or accross the board?
    api._pouch = {
        adapter: 'pouch',
        
        withCredentials: function() {},
        
        info: function(options) {
	    options.success({ pouchdb: "Welcome", version: PouchDB.version });
        },      
        
        config: notApplicable,
        
        log: function(options) {
            options.error(418, 'Not applicable to PouchDB');
        },
        login: function(options) {
            options.error(418, 'Not applicable to PouchDB');
            // options.success({ ok: true, name: options.name, roles: ['_admin']});
        },
        logout: function(options) {
            options.error(418, 'Not applicable to PouchDB');
            // options.success({ ok: true });
        },
        session: function(options) {
            options.error(418, 'Not applicable to PouchDB');
            // options.success({ ok: true, userCtx: { name: options.name, roles: ['_admin'] },
            //                 info: { authenticated: 'always' }} );
        },
        
        signup: function(user_doc, password, options) {
            options.error(418, 'Not applicable to PouchDB');
            // options.success({ ok: true });
        },
        userDb: function(cb) { cb(null, 418, 'Not applicable to PouchDB', "Not applicable to PouchDB" )},
        
        allDbs: function(options) {
            //TODO: on node you could actually read the directory listing on the hard disk!!
            //only on webkit:
            if (typeof indexedDB !== "undefined" && indexedDB.webkitGetDatabaseNames)
            {
                var dbs = indexedDB.webkitGetDatabaseNames();
                dbs.onerror = function(err) {
                    console.log('error', err);
                    // options.error;   
                };
                dbs.onsuccess = function(event)
                {
                    var result = event.srcElement.result;
                    result = Object.keys(result).filter(function(k) {
                        return k !== 'length' & k.slice(0, 7) !== '_pouch_';
                    }).map(function(k) {
                        return result[k].slice(7);
                    });
                    options.success(result);;
                };
            }
            else notApplicable(options, 'Only on webkit can database names be listed');
        },
        
        
        //use https://github.com/broofa/node-uuid
        //or https://gist.github.com/jed/982883
        newUUID: function() {
            function makeUUID() {
                return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
                    var r = Math.random()*16|0, v = r;
                    return v.toString(16);
                });
            }
            return makeUUID();
        },
        
        replicate: function(repDoc, options) {
            console.log(repDoc, options);
            var resp = PouchDB.replicate(repDoc.source, repDoc.target, repDoc, function(err, result) {
                if (err) options.error(err);
                else options.success(result);
            }); 
        },
        
        // replicateRemove: function(repDoc, options) {
        //     options.error(null, "Pouchdb cannot remove replications as far as I know..");
        // },
        
        
        activeTasks: notApplicable,
        listView: notApplicable,
        
        sync: notImplemented,
        
        dbConflicts: notImplemented,
        docConflicts: notImplemented,
        docResolveConflicts: notImplemented,
        dbChanges: notImplemented,
        
        db: function(name) {
            return {
                name: name,
                create: function(options) {
                    new PouchDB(name);
                    options.success({ok: true});
                },
                drop: function(options) {
                    PouchDB.destroy(name, function(err, info) {
                        if (err) options.error(null, err);
                        else options.success(info || {ok: true});
                    });
                },
                allDocs: function(options) {
                    var db = new PouchDB(name);
                    db.allDocs(options, function(err, doc) {
                        if (err) options.error(null, err);
                        else options.success(doc);
                    });
                },
                openDoc: function(id, options) {
                    var db = new PouchDB(name);
                    db.get(id, options, function(err, doc) {
                        if (err) options.error(err.message === 'deleted' ? 404: null, err.message);
                        else options.success(doc);
                    });
                },
                saveDoc: function(doc, options) {
                    var db = new PouchDB(name);
                    db[doc._id ? 'put' : 'post'](doc, function(err, response) {
                        if (err) options.error(null, err);
                        else options.success(response);
                    });
                },
                bulkSave: function(docs, options) {
                    var db = new PouchDB(name);
                    db.bulkDocs(docs, options, function(err, result) {
                        if (err) options.error(null, err);
                        else {
                            var index = -1;
                            result = result.map(function(doc) {
                                index++;
                                if (doc.error) return {
                                    error: doc.name,
                                    reason: doc.message,
                                    id: docs.docs[index]._id
                                };
                                else return doc;
                            });
                            options.success(result);   
                        }
                    });
                },
                
                bulkRemove: function(docs, options){
                    docs.docs.forEach(
                        function(doc){
                            doc._deleted = true;
                        }
                    );
                    this.bulkSave(docs, options);
                },
                
                removeDoc: function(doc, options) {
                    var db = new PouchDB(name);
                    db.remove(doc, options, function(err, doc) {
                        if (err) options.error(null, err);
                        else options.success(doc);
                    });
                },
                info: function(options) {
                    var db = PouchDB(name);
                    db.info(function(err, info) {
                        if (err) options.error(null, err);
                        else options.success(info);
                    });
                },
                allDesignDocs: function(options) { //works, but nonsensical for pouchdb
                    var db = new PouchDB(name);
                    options.startkey = "_design";
                    options.endkey = "_design0";
                    this.allDocs(options);
                },
                
                //TODO: test!!!
                changes: function(since, options) {
                    var db = new PouchDB(name);
                    options.since = since;
                    var result = db.changes(options);
                    result.stop = result.cancel;
                    return result;
                },
                compact: function(options) {
                    var db = new PouchDB(name);
                    db.compact(function(info) {
                        options.success(info || { ok: true});
                    });
                },
                
                query: notImplemented,
                
                view: function(designDoc, options) {
                    notApplicable(options);
                },
                viewCleanup: notApplicable,
                compactView: function(designDoc, options) {
                    notApplicable(options);
                },
                copyDoc: notApplicable,
                list: notApplicable,
                
                // allApps: notImplemented, //not used in vouchdb
                getDbProperty: function(property, options) {
                    notApplicable(options);
                },
                setDbProperty: function(property, sec_obj, options) {
                    notApplicable(options);
                },
                query: function(mapfunc, foo, lang, options) {
                    var db = new PouchDB(name);
                    options.include_docs = true;
                    db.query(mapfunc, options, function(err, response) {
                        if (err) options.error(err);
                        else options.success(response);
                    });
                }
                
            };
        }

        
        
    
        
    
    };
    return api;
});     

// console.log('vouchdb_pouch loaded') ;
