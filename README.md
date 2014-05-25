In testing stage at the moment...
TODO/tes:

* Test in nodejs
* Test changes feed
* Test continuous replication
* Cancel replications for pouch
* Implement seemless emulation, to erase all difference between pouch and couch
  from a api point of view.
* Test conflicts and resolution
* Finish and write proper tests.

vouchdb
------

An api for couchdb and pouchdb using vows, deployable on both node and the browser.

### Install in browser

Add script tags for the following files to your html file:

	jquery.js 
	
Any version will do probably.
	
	lib/vow.js

Promises implementation. You will have a new global `VOW`.  

	lib/vouchdb.js 
	
This will create a global variable `vouchdb`. Use its properties to access
couchdb using a promises based api. This is just the wrapper though, to access
an actual database include one or all of the following files:
	
	lib/vouchdb_couch.js  
	
Attaches the _couch object to vouchdb. Used to access a couchdb instance.
	 
    pouchdb.js 
	
Use the one included or get the latest one from [pouchdb](http://pouchdb.com).	
	
	lib/vouchdb_pouch.js 
	
This attaches the _pouch object to vouchdb. Now couchapi can also talk to the
in browser pouchdb.
	
### Install in node

In your project folder execute:

    npm install vouchdb
	
or

	npm install git://github.com/michieljoris/vouchdb.git
	
This uses the nodejs versions of jquery and vow. The module can be required
with:

    var vouchdb = require('vouchdb);
	
### Use

The api can be accessed through functions attached to `vouchdb`. The
couch version of the api (jquery.couch.js) can still be accessed through
`vouchdb._couch`. The pouch version through `couchapi._pouch`.

Checkout the docco generated file
[vouchdb.html](https://rawgithub.com/Michieljoris/vouchdb/master/docs/vouchdb.html).

### Test

##### Browser

The whole project really only consists of a few files, namely the ones in the
lib directory. 

Run a CouchDB instance locally or on the net.

Start up a server and serve up the index.html in the www directory, and open the
console.

##### Nodejs

    node test/node/test.js

### Notes
		
The promises implementation is the one from
[Douglas Crockford](https://github.com/douglascrockford/monad/raw/master/vow.js). Simple
and sufficient.

vouchdb is mirroring almost all functionality of the jquery javascript
adapter that comes with futon, but the functions are returning vows
instead of expecting success and error callbacks passed in.

I added a few more utility functions mainly to easily configure and modify
security objects and design documents.

One addition is an implementation of

	1. GET docid?conflicts=true
	2. For each member in the _conflicts array:
	 GET docid?rev=xxx
	If any errors occur at this stage, restart from step 1.
	(There could be a race where someone else has already resolved this
	conflict and deleted that rev)
	3. Perform application-specific merging
	4. Write _bulk_docs with an update to the first rev and deletes of
	the other revs.
	
as described in
[http://wiki.apache.org/couchdb/Replication_and_conflicts](http://wiki.apache.org/couchdb/Replication_and_conflicts)

The application-specific merging can be done by passing in a resolver
or before calling a returned continuing function.

The bulkSave operation is not atomic, unlike the ruby example implementation.
Not quite sure yet whether that is a good thing or
not. [http://localhost:5984/_utils/docs/api/database.html?highlight=bulk#post-db-bulk-docs](http://localhost:5984/_utils/docs/api/database.html?highlight=bulk#post-db-bulk-docs)

A good doc for the original jquery.couch.js version is
[http://bradley-holt.com/2011/07/couchdb-jquery-plugin-reference/](http://bradley-holt.com/2011/07/couchdb-jquery-plugin-reference/)
and
[http://daleharvey.github.io/jquery.couch.js-docs/symbols/index.html](http://daleharvey.github.io/jquery.couch.js-docs/symbols/index.html)
I've modified it slightly so it can be run in the browser as will as on
nodejs. Access it using `vouchdb._couch`.

Pouchdb is an in browser database with CouchDB functionality. Using vouchdb your
application can be agnostic about what backend it is using: Pouchdb or
Couchdb. vouchdb uses couchapi_couch.js (modified jquery.couch.js from the CouchDB server
Installation) to connect to a CouchDB instance both on node and in the browser,
and not the PouchDB api because it is more flexible, code is easier to
understand (just a bunch of direct ajax requests) and a lot smaller than
PouchDB. 

### TODO

Some functionality is missing, attachments, show and list views etc. Wrote it
for my own use. As I need more features I might add them.

Since we're using node-jquery for an easy port of vouchdb to node the
xmlhttprequest is not supporting sessions at the moment on nodejs. I hope to fix
that. Hope to factor out the jquery dependency as well.

