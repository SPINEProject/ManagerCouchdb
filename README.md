# ManagerCouchdb
ManagerCouchdb is a javascript library for managing CouchdDB servers and databases. This library was created and is maintained at the Center for Neurological Imaging (https://cni.bwh.harvard.edu/).

## How to install it
```
npm install --save managercouchdb
```

## How to use it
```
const managerCouchdb = require('managerCouchdb')

const serverManagerCouchdb = await managerCouchdb.getServerManager("localhost:5984")
const dbManagerCouchdb = await managerCouchdb.getDatabaseManager("localhost:5984", "databasename")
```


## How to test it
Checkout project with git and run `test/testAll` and `test/testDesign` node scripts. 
Check `SERVER_URL` and `DB_NAME` settings if they fit to your environment.
   
### Server manager
```
var serverRunning = await serverManagerCouchdb.isServerRunning()

var serverInformation = serverManagerCouchdb.getServerInformation()

var dbExist = await serverManagerCouchdb.databaseExist("databasename")

var resDestroyDatabase = await serverManagerCouchdb.destroyDatabase("databasename")

var resCreateDb = await serverManagerCouchdb.createDatabase("databasename")
```

### Database manager
```
var dbInformation = await dbManagerCouchdb.getDatabaseInformation()

var resInsertDoc = await dbManagerCouchdb.insertDocument(document)

var resDestroyDoc = await dbManagerCouchdb.destroyDocument(documentId, revisionId)

var resInsertDocsBulk = await dbManagerCouchdb.insertDocumentInBulk(documents)

var document = await dbManagerCouchdb.getDocument(documentId)

var viewResults = await dbManagerCouchdb.getView(designName, viewName, keys)

var resView = await  dbManagerCouchdb.getViewWithQuery(designName,viewName, queryParams,includeDocs);

var design = await dbManagerCouchdb.getDesign()

var resFetch= await dbManagerCouchdb.fetchDocumentsInBulk(toBeFetched);

var resDel = await dbManagerCouchdb.deleteDocumentInBulk({"docs":arrayOfDocIds});


```

## What's new in Version 2.0


Dependencies:
 - removed package `request-promise-native` from dependencies (package was blocking  upgrade of `nano` to version > 8.2.3)
 - upgraded `nano` to version `10.0.0`   


Added db document functions:
  - `getDesign` for getting all design and view documents,
  - `deleteDocumentsInBulk` for deleting array of documents, 
  - `fetchDocumentsInBulk` for fetching array of documents,
  - `getViewWithQuery` for getting view with different key options
 
Removed db document functions:
  - `getViewWithMultipleQueries`: not needed anymore, replaced partially by `getViewWithQuery`
  
Modified db document functions:
 - `destroyDocument`: revision parameter is optional,

Tests:
  - added test for Node (no testing framework is required)


