'use strict';

const SERVER_URL = "http://localhost:5984";
const DB_NAME = "dbname"; // do not use production DB -  just create a testing one!!!


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
    const dbManagerCouchdb = await dbManager.getDatabaseManager(SERVER_URL, DB_NAME);

    // --- getDesign ---
    reqResult= await dbManagerCouchdb.getDesign();
    console.log(JSON.stringify(reqResult));
    condition = reqResult!=null && reqResult.hasOwnProperty("rows");
    console.log("Design test: ", testResult());

  }
  catch(e){
    console.log('Error in connection. ERROR:', e);
    throw e
  }
};

//Execute the main process
main();
