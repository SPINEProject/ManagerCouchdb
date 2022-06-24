'use strict';

const SERVER_URL = "http://localhost:5984";
const DB_NAME = "testing"; // do not use production DB -  just create a testing one!!!


const TESTING_DOCS = [
  {"docType": "test", "value":1},
  {"docType": "test", "value":2},
  {"docType": "test", "value":3},
  {"docType": "test", "value":1},
  ];

/**
 * No need to use JEST here! it can be tested with Node process only!
 *
 * @returns {boolean} true if the process was executed, false otherwise
 * @throws {string} if an error occurred during the process
 */
const main = async () => {

  let reqResult = null;
  let condition = null;
  const testResult = ()=>{
    if (condition) return "PASSED";
    return "FAILED";
  };
  try {
    const dbManager = require("../databaseManager");
    const sManager = require("../serverManager");

    const serverManager = await sManager.getServerManager(SERVER_URL);


    // ----- server manager -----
    // --- isServerRunning ---
    if (!await serverManager.isServerRunning())
      return;

    // --- getServerInformation ---
    reqResult = await serverManager.getServerInformation();
    console.log("Server: ", reqResult);


    console.log("=============Server manager tests============= ");
    // server exist
    condition = reqResult!=null &&  reqResult.hasOwnProperty("couchdb");
    console.log("Server information && server running test: ", testResult());



    // --- createDatabase ---
    reqResult = await serverManager.createDatabase("testing111222");
    condition = reqResult;
    console.log("Created db test: ",testResult());


    // --- databaseExist ---
    reqResult = await serverManager.databaseExist("testing111222");
    condition = reqResult;
    console.log("Exist db test: ",testResult());


    // --- destroyDatabase ---
    reqResult = await serverManager.destroyDatabase("testing111222");
    condition = reqResult;
    console.log("Destroyed db test: ",testResult());

    if (!await serverManager.databaseExist(DB_NAME))
      await serverManager.createDatabase(DB_NAME);

    const dbManagerCouchdb = await dbManager.getDatabaseManager(SERVER_URL, DB_NAME);


    // --- create View for test docs---
    let isAlready = true;
    let viewRes = null;
    try {
       viewRes = await dbManagerCouchdb.getDocument("_design/query-demo");
    }catch(err){
      isAlready = false;
    }

    if (!isAlready || viewRes === null) {
      await dbManagerCouchdb.insertDocument({
        "_id": "_design/query-demo",
        "views": {
          "test": {
            "map": "function (doc) {  emit([doc.value, doc._id], doc);}"
          }
        },
        "language": "javascript"
      });
    }

    console.log("=============Database manager tests============= ");
    reqResult= await dbManagerCouchdb.getDatabaseInformation();
    condition = reqResult!=null && reqResult.hasOwnProperty("db_name") && reqResult.db_name === DB_NAME;
    console.log("Database info test: ", testResult());


    console.log("=============Database documents tests============= ");

    // --- Access to nanoConnection object ---
    reqResult = await dbManagerCouchdb.nanoConnection.info();
    condition = reqResult!=null && reqResult.hasOwnProperty("db_name") && reqResult.db_name === DB_NAME;
    console.log("Nano test: ", testResult());


    // --- getDesign ---
    reqResult= await dbManagerCouchdb.getDesign();
    condition = reqResult!=null && reqResult.hasOwnProperty("rows");
    console.log("Design test: ", testResult());


    // --- insertDocument ---
    reqResult= await dbManagerCouchdb.insertDocument(TESTING_DOCS[0]);
    condition = reqResult!=null && reqResult.ok && reqResult.hasOwnProperty("id");
    console.log("Insert test: ", testResult());



    // --- deleteDocument ---
    let toBeDeleted = reqResult.id;
    reqResult= await dbManagerCouchdb.destroyDocument(toBeDeleted);
    condition = reqResult!=null && reqResult.ok;
    console.log("Delete test: ", testResult());


    // --- insertDocumentInBulk ---
    reqResult= await dbManagerCouchdb.insertDocumentInBulk({"docs": TESTING_DOCS});
    condition = reqResult!=null && Array.isArray(reqResult) && reqResult.length === 4;
    console.log("Insert bulk test: ", testResult());


    // --- getView ---
    reqResult = await  dbManagerCouchdb.getView("query-demo","test");
    condition = reqResult!=null && Array.isArray(reqResult.rows) && reqResult.rows.length > 0;
    console.log("View test: ", testResult());

    let toBeFetched = reqResult.rows.map(el=>el.id);
    toBeDeleted =  reqResult.rows.map(el=>el.value);


    // --- getViewWithQuery ---
    let queryParams = {startkey:[1], endkey:[1,{}]};
    reqResult = await  dbManagerCouchdb.getViewWithQuery("" +
      "query-demo","test", queryParams,true);
    condition = reqResult!=null && Array.isArray(reqResult.rows) && reqResult.rows.length === 2;
    console.log("Query test: ", testResult());

    // --- getViewWithQuery and keys---
    queryParams = {
      keys : [
        [1, toBeFetched[0]]
      ]
    };
    reqResult = await  dbManagerCouchdb.getViewWithQuery("" +
      "query-demo","test", queryParams,true);
    condition = reqResult!=null && Array.isArray(reqResult.rows) && reqResult.rows.length === 1;
    console.log("Query with 'keys' test: ", testResult());


    // --- fetchDocumentsInBulk ---
    reqResult= await dbManagerCouchdb.fetchDocumentsInBulk(toBeFetched);
    condition = reqResult!=null && Array.isArray(reqResult.rows) && reqResult.rows.length >= 4;
    console.log("Fetch bulk test: ", testResult());

    // --- deleteDocumentInBulk ---
    reqResult= await dbManagerCouchdb.deleteDocumentInBulk({docs:toBeDeleted});
    condition = reqResult!=null && Array.isArray(reqResult) && reqResult.length === 4;
    console.log("Delete bulk test: ", testResult());

  }
  catch(e){
    console.log('Error in connection. ERROR:', e);
    throw e
  }
};

//Execute the main process
main();
