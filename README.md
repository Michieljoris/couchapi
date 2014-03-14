A simple vows based wrapper for jquery.couch.js.
------

In testing stage at the moment...

Some functionality is missing, attachments, show and list views etc. Wrote it
for my own use. As I need more features I might add them.

Since we're using node-jquery for an easy port of couchapi to node the
xmlhttprequest is not supporting sessions at the moment on nodejs. I hope to fix
that. Hope to factor out the jquery dependency as well.

Works both in the browser and on nodejs (well I hope, needs testing).

I hope to add compatibility with PouchDB as well so that if you have an app that
mainly talks to CouchDB it is nice to have a light weight adapter in the
combination of couchapi and jquery.couch.js. But if you want to add
functionality for using the browser's internal indexedb just add pouchdb.js to
your site and initialize couchapi without an url. Same goes for using couchapi
on nodejs, pouchdb is already added as a dependency though. Your code can stay
the same.

In the browser copy the following files from the lib directory to your script
directory, and add the appropriate script tags to your html file:

	jquery.js
	vow.js
	couchapi.js //adds the vowed api to the global couchapi
	couchapi_async.js  //attaches _async to couchapi 
	 
If you want to access PouchDB managed internal browser databases instead or
also, add the script tags for:

    pouchdb.js 
	pouchdb-adapter.js //attaches _pouch to couchapi

You will have a global named `couchapi` (and `VOW` as well).

On nodejs 

    npm install couchapi
	
or

	npm install git://github.com/michieljoris/couchapi.git
	
will fetch the nodejs versions of jquery and vow. The module can be required
with:

    var couchapi = require('couchapi');
	
In both cases CouchDB can accessed through functions attached to `couchapi`. The
async version of the api (jquery.couch.js) can still be accessed through
`couchapi._async`. The pouch version through `couchapi._pouch`.
		
The promises implementation is the one from
[Douglas Crockford](https://github.com/douglascrockford/monad/raw/master/vow.js). Simple
and sufficient.

It is mirroring almost all functionality of the jquery javascript
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
nodejs. Access it using `couchapi._async`.

Pouchdb is an in browser database with CouchDB functionality. Using couchapi your
application can be agnostic about what backend it is using: Pouchdb or
Couchdb. Couchapi uses couchapi_async.js (jquery.couch.js from the CouchDB server
installation) to connect to a CouchDB instance both on node and in the browser,
and not the PouchDB api because it is more flexible, code is easier to
understand (just a bunch of direct ajax requests) and a lot smaller than
PouchDB. 

A docco generated html help file can be found in the docs directory.


