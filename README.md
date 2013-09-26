A simple vows based wrapper for jquery.couch.js.
------

The promises implementation is the one from [Douglas Crockford](https://github.com/douglascrockford/monad/raw/master/vow.js). Simple
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
[http://wiki.apache.org/couchdb/Replication_and_conflicts]()

The application-specific merging can be done by passing in a resolver
or before calling a returned continuing function.

The bulkSave operation is not atomic, unlike the ruby example
implementation.
Not quite sure yet whether that is a good thing or not. [http://localhost:5984/_utils/docs/api/database.html?highlight=bulk#post-db-bulk-docs]()

A good doc for the original jquery version is
[http://bradley-holt.com/2011/07/couchdb-jquery-plugin-reference/]()

An idea is to adapt it so it can be used with pouchdb as well, just by setting a parameter.

If you have an app that mainly talks to CouchDB it is nice to have a light weight adapter in the combination of couchapi and jquery.couch.js.

But if you want to add functionality for using the browser's internal indexedb you just add pouchdb.js to your site and set the parameter on couchapi, withouth changing any code of your app.

TODO

* Not all of the functions return proper error messages yet.
* More docs may follow.




