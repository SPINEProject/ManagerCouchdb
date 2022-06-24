
module.exports.getDatabaseManager = async (serverUrl, databaseName) => {

  // Variable to be returned
  const dbManagerCouchdb = {};

  // Get the nano connection
  let nano = require('nano')(serverUrl);

  dbManagerCouchdb.nanoConnection = await nano.db.use(databaseName);

  /**
   * Function that returns the information about the database (NOT SERVER!)
   * @resolves {Object} couchdbInfo object with the information retrieve from
   *             couchdb
   * @rejects {Promise<string>} if an error occurs in the request
   */
  dbManagerCouchdb.getDatabaseInformation = async ( ) => {
    return new Promise( async (resolve, reject) => {

      try {
        let couchdbInfo = await nano.db.get(databaseName);
        resolve(couchdbInfo)
      }
      catch(err){
        reject('Error getting the database information. Error: ' + err)
      }
    })
  };

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
  };

  /**
   * Function that deletes a document in the database
   * @param {string} id is the id of the document to be removed
   * @param {string} rev is the optional revision id of the document to be removed
   * @resolves {Object} confirmation document from couchdb
   * @rejects {Promise<string>} if an error occurs in the request
   */
  dbManagerCouchdb.destroyDocument = async (id, rev=undefined ) => {
    return new Promise( (resolve, reject) => {

      if (rev === undefined){
        dbManagerCouchdb.nanoConnection.get(id, function (err, body) {
          if (err) {
            reject (err);
          }
          if (!err && body!=null) {
            dbManagerCouchdb.nanoConnection.destroy(id, body._rev, function (err, body) {
              if (err) {
                reject(err)
              }
              else resolve(body);
            });
          }
        })
      }
      else
        dbManagerCouchdb.nanoConnection.destroy(id, rev, function(err, body) {
          if (!err){
            resolve(body)
          }
          else{
            reject('Error destroying document. \n\t ERROR:' + err)
          }
        });

    })
  };

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
  };

  /**
   * Nano request for fetching multiple documents
   * Wrapper over nano.fetch
   * @param {array} documentIds - array of document ids
   * @resolves {Promise<string>} result of the operation
   * @rejects {Promise<string>} if an error occurs in the request
   */
  dbManagerCouchdb.fetchDocumentsInBulk = async function(documentIds){
    return new Promise((resolve, reject) => {

      dbManagerCouchdb.nanoConnection.fetch({keys:documentIds}, function (err, body) {
        if (!err) {
          resolve(body)
        }
        else {
          if(err.reason === 'missing')
            resolve(null);
          else
            reject(err)
        }
      })

    })// Promise
  };


  /**
   * Function that removes documents in a couchdb database in bulk mode
   * @resolves {Promise<string>} result of the operation
   * @rejects {string} Error message
   * @param bulkDocument - object containing array of docs {docs:[]} to be removed
   */
  dbManagerCouchdb.deleteDocumentInBulk = async( bulkDocument) => {
    return new Promise( (resolve, reject) => {

      const docs = bulkDocument.docs;
      docs.map(el=>{el['_deleted']=true; return el});
      dbManagerCouchdb.nanoConnection.bulk(bulkDocument, function(err, body) {
        if (!err) {
          resolve(body)
        }
        else{
          console.log('Error inserting documents in bulk mode. Error: ',err);
          reject(err)
        }
      });
    })
  };
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
            resolve(null);
          else {
            console.log('Error getting document. ERROR:',err);
            reject(err)
          }
        }
      })

    })
  };

  /**
   * Function that returns the result of executing a view in couchdb
   * @param {string} designName is the name of the design of the view
   * @param {string} viewName is the name of the view
   * @param {Object} keys is the optional keys send to the the view execution
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
  };

  /**
   * Nano request for getting ALL designs and views.
   *
   * @returns {Promise<void>}
   */
  dbManagerCouchdb.getDesign  = async ( ) => {
    return new Promise( async (resolve, reject) => {

      let params = {
            startkey:"_design/",
            endkey:"_design0",
            include_docs:true
          };

      try {
        let couchdbInfo = await dbManagerCouchdb.nanoConnection.list(params);
        resolve(couchdbInfo)
      }
      catch(err){
        reject('Error getting the database information. Error: ' + err)
      }
    });
  };


  /**
   * Nano request for getting view with POST and sending queries for filtering.
   * @param designName
   * @param viewName
   * @param keys -  queries like [{startkey:["key1","key2","key3"], endkey:["key1","key2","key3"]}]
   * @param includeDocs - optional parameter for getting docs in resultSet
   * @returns {Promise<void>}
   */
  dbManagerCouchdb.getViewWithQuery  = async (designName, viewName, keys, includeDocs=true ) => {
    return new Promise(async  (resolve, reject) => {

      let params = {
       ...keys,
        include_docs: includeDocs
      };
      try {
        let viewRes = await dbManagerCouchdb.nanoConnection.view(designName, viewName, params);
        resolve(viewRes);
      }
      catch(err){
        reject('Error getting the database information. Error: ' + err)
      }
    });
  };



  return dbManagerCouchdb;
};