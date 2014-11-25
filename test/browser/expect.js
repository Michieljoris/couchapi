 var expect = {
 "pouch": {
  "info()": {
   "pouchdb": "Welcome",
   "version": "2.2.2"
  },
  "login(\"root\",\"root\")": {
   "status": 418,
   "reason": "Not applicable to PouchDB"
  },
  "dbAll()": []
 },
 "couch": {
  "info()": {
   "couchdb": "Welcome",
   "uuid": "1c9838cecb2feae6a7eadd7eab9f21dd",
   "version": "1.4.0",
   "vendor": {
    "version": "1.4.0",
    "name": "The Apache Software Foundation"
   }
  },
  "login(\"root\",\"root\")": {
   "status": 401,
   "reason": "Name or password is incorrect."
  },
  "dbAll()": [
   "_replicator",
   "_users",
   "asjkkdfkf42asdfas888dkfjakd",
   "multicap",
   "mydatabase",
   "reptest",
   "roster_data"
  ]
 }
};        
  
 
if (typeof module != 'undefined' && module &&
      typeof exports == 'object' && exports && module.exports === exports) {
  module.exports = expect;
}
   
