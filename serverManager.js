
module.exports.getServerManager = async (serverUrl) => {

  // Variable to be returned
  const serverManagerCouchdb = {};
  
  let nano = require('nano')(serverUrl);

  /**
   * Function that checks if the server is reachable
   * @resolves {bool} true if the server is reachable, false otherwise
   * @rejects {Promise<string>} if an error occurs in the request
   */
  serverManagerCouchdb.isServerRunning = async () => {
    return new Promise( async (resolve) => {

      try {
        await nano.info();
        resolve(true)
      }
      catch(err){
        resolve(false)
      }

    })
  };

  /**
   * Function that returns the server information
   * @resolves {Object} Information from the server as returned by couchdb
   * @rejects {Promise<string>} if an error occurs in the request
   */
  serverManagerCouchdb.getServerInformation = async () => {
    return new Promise( async (resolve, reject) => {

      try {
        let serverInformation = await nano.info();
        resolve(serverInformation)
      }
      catch(err){
        reject('Error getting server information. Error: ' + err)
      }

    })
  };

  /**
   * Function that checks if a database exists in the couchdb server
   * @resolves {bool} true if the database exists, false otherwise
   * @rejects {Promise<string>} if the server is not reachable
   * @param databaseName
   */
  serverManagerCouchdb.databaseExist = async (databaseName) => {
    return new Promise( async (resolve, reject) => {

      let isServerUp = await serverManagerCouchdb.isServerRunning();
      if( !isServerUp )
        reject("The server is not reachable.");

      try {
        await nano.db.get(databaseName);
        resolve(true)
      }
      catch(err){
        resolve(false)
      }

    })
  };

  /**
   * Function that creates a database in the couchdb server
   * @param {string} databaseName is the name of the database
   * @resolves {Object} Confirmation of database creation
   * @rejects {Promise<string>} if an error occurs in the request or the server
   *            is not reachable
   */
  serverManagerCouchdb.createDatabase = async (databaseName) => {
    return new Promise( async (resolve, reject) => {

      let isServerUp = await serverManagerCouchdb.isServerRunning();
      if( !isServerUp )
        reject("The server is not reachable.");

      await nano.db.create(databaseName, function (err, body) {
        if (!err) {
          resolve(true)
        }
        else
          reject('Error creating database ' + databaseName + '. Error: ' + err)
      });

    })
  };

  /**
   * Function that destroys a database in the couchdb server
   * @param {string} databaseName is the name of the database
   * @resolves {bool} true if the database was destroyed
   * @rejects {Promise<string>} if an error occurs in the request or the server
   *            is not reachable
   */
  serverManagerCouchdb.destroyDatabase = async(databaseName) => {
    return new Promise( async (resolve, reject) => {

      let isServerUp = await serverManagerCouchdb.isServerRunning();
      if( !isServerUp )
        reject("The server is not reachable.");

      await nano.db.destroy(databaseName, function(err, body){
        if(!err){
          resolve(true)
        }
        else{
          reject('Error deleting the database. Error:' + err)
        }

      });

    })
  };

  return serverManagerCouchdb

};
