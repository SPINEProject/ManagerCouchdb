# ManagerCouchdb
Manager for CouchdDB servers and databases

## How to install it
```
npm install --save github:SPINEProject/ManagerCouchdb
```

## How to use it
```
const managerCouchdb = require('managerCouchdb')

const serverManagerCouchdb = await managerCouchdb.getServerManager("localhost:5984")
const dbManagerCouchdb = await managerCouchdb.getDatabaseManager("localhost:5984", "databasename")
```

### Server manager
```
var serverRunnig = serverManagerCouchdb.isServerRunning()

var serverInformation = serverManagerCouchdb.getServerInformation()

var dbExist = await serverManagerCouchdb.databaseExist("databasename")

var resDestroyDatabase = await serverManagerCouchdb.destroyDatabase("databasename")

var resCreateDb = await serverManagerCouchdb.createDatabase("databasename")
```

### Database manager
```var dbInformation = dbManagerCouchdb.getDatabaseInformation()

var resInsertDoc = await dbManagerCouchdb.insertDocument(document)

var resInsertDocsBulk = await dbManagerCouchdb.insertDocumentInBulk(documents)

var document = dbManagerCouchdb.getDocument(documentId)

var viewResults = dbManagerCouchdb.getView(designName, viewName, keys)

var viewResultsMultQueries = dbManagerCouchdb.getViewWithMuktipleQueries(designName, viewName, arrayKeys)

```
