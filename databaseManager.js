var rp = require('request-promise-native');

module.exports.getDatabaseManager = async (serverUrl, databaseName) => {

  // Variable to be returned
  var dbManagerCouchdb = {}

  // Get the nano connection
  let nano = require('nano')(serverUrl)

  dbManagerCouchdb.nanoConnection = await nano.db.use(databaseName)

  /**
   * Function that returns the information from the database
   * @resolves {Object} couchdbInfo object with the information retrieve from
   *             couchdb
   * @rejects {Promise<string>} if an error occurs in the request
   */
  dbManagerCouchdb.getDatabaseInformation = async ( ) => {
    return new Promise( async (resolve, reject) => {

      let options = { uri: serverUrl, method: 'GET' };

      try {
        let couchdbInfo = await
        rp(options)
        resolve(couchdbInfo)
      }
      catch(err){
        reject('Error getting the database information. Error: ' + err)
      }
    })
  }

  /**
   * Function that inserts a document in the database
   * @param {Object} document is the document to be inserted
   * @resolves {Object} confirmation document from couchdb
   * @rejects {Promise<string>} if an error occurs in the request
   */
  dbManagerCouchdb.insertDocument = async (document) => {
    return new Promise( (resolve, reject) => {

      dbManagerCouchdb.nanoConnection.insert(document, function(err, body) {
        if (!err){
          resolve(body)
        }
        else{
          reject('Error inserting document. \n\t ERROR:' + err)
        }
      });

    })
  }

  /**
   * Function that deletes a document in the database
   * @param {string} id is the id of the document to be removed
   * @param {string} rev is the revision id of the document to be removed
   * @resolves {Object} confirmation document from couchdb
   * @rejects {Promise<string>} if an error occurs in the request
   */
  dbManagerCouchdb.destroyDocument = async (id, rev) => {
    return new Promise( (resolve, reject) => {

      dbManagerCouchdb.nanoConnection.destroy(id, rev, function(err, body) {
        if (!err){
          resolve(body)
        }
        else{
          reject('Error destroying document. \n\t ERROR:' + err)
        }
      });

    })
  }

  /**
   * Function that inserts documents in a couchdb database in bulk mode
   * @param {object} bulkDocument is an object with the documents to be inserted
   * @resolves {Promise<string>} result of the operation
   * @rejects {Promise<string>} if an error occurs in the request
   */
  dbManagerCouchdb.insertDocumentInBulk = async( bulkDocument) => {
    return new Promise( (resolve, reject) => {

      dbManagerCouchdb.nanoConnection.bulk(bulkDocument, function(err, body) {
      if (!err) {
        resolve(body)
      }
      else{
        reject('Error inserting documents in bulk mode. \nError:' + err)
      }

    });

  })
  }

  /**
   * Function that returns a document in the database given the _id of the
   * document
   * @param {string} documentId is the _id of the document in couchdb
   * @resolves {Object} document returned by couchdb, null if the document does
   *             not exist
   * @rejects {Promise<string>} if there is an error in the request
   */
  dbManagerCouchdb.getDocument = async function(documentId){
    return new Promise(async function(resolve, reject) {

      dbManagerCouchdb.nanoConnection.get(documentId, function (err, body) {
        if (!err) {
          resolve(body)
        }
        else {
          if(err.reason === 'missing')
            resolve(null)
          else {
            console.log('Error getting document. ERROR:',err);
            reject(err)
          }
        }
      })

    })
  }

  /**
   * Function that returns the result of executing a view in couchdb
   * @param {string} designName is the name of the design of the view
   * @param {string} viewName is the name of the view
   * param {Object} keys is the optional keys send to the the view execution
   * @resolves {Object} document replied by couchdb after executing the view
   * @rejects {Promise<string>} if there is an error in the request
   */
  dbManagerCouchdb.getView = async (designName, viewName, keys = {}) => {
    return new Promise(function (resolve, reject) {

      dbManagerCouchdb.nanoConnection.view(designName, viewName, keys, function (err, body) {
        if (!err) {
          resolve(body)
        }
        else{
          reject('ERROR getting view ', designName, '/', viewName, ". \nERROR:", err)
        }
      })

    })
  }

  /**
   * Function that returns the result of executing a view in couchdb using
   * multiple queries
   * @param {string} designName is the name of the design of the view
   * @param {string} viewName is the name of the view
   * param {array} arrayKeys is an array of objects where each object represents
   *         the keys for each query
   * @resolves {Object} document replied by couchdb after executing the view
   * @rejects {Promise<string>} if there is an error in the request
   */
  dbManagerCouchdb.getViewWithMuktipleQueries  = async (designName, viewName, arrayKeys ) => {
    return new Promise( async (resolve, reject) => {

      // Get the version of the server
      let options = { uri: serverUrl, method: 'GET' };

      var serverInformation = null
      try {
        serverInformation = await rp(options)
      }
      catch(err){
        reject('Error getting server information. Error: ' + err)
      }

      var serverVersion = serverInformation.version
      var serverVersionSplit = serverVersion.split(".")


      // If version >= 2.2 the multiple queries are natively implemented
      if( serverVersionSplit[0] > 2 || (serverVersionSplit[0] = 2 && serverVersionSplit[1]>=2)) {

        let options = {
          url: serverUrl + '/' + databaseName + "/_design/" + designName +
          "/_view/" + viewName + '?include_docs=true',
          method: 'POST',
          json: keys
        };

        try {
          let result = await rp(options)
          resolve(results)
        }
        catch (err) {
          reject('Error executing view with multiple queries. \nError: ' + err)
        }
      }
      // Else we implemented sending multiple queries and gathering the results
      else{
        try {
          var results = []
          for (let i in keys.queries) {
            let key = keys.queries[i]
            key.include_docs = true
            let resViewKey = await
            dbManagerCouchdb.getView(designName, viewName, key)
            results.push(resViewKey)
          }

          let res = {
            results: results
          }
          resolve(res)
        }
        catch (err) {
          reject('Error executing view with multiple queries. \nError: ' + err)
        }
      }
    })
  }

  return dbManagerCouchdb;
}