const serverManager = require('./serverManager');
const databaseManager = require('./databaseManager');

module.exports.getServerManager = async (serverUrl) => {
  return await serverManager.getServerManager(serverUrl)
};

module.exports.getDatabaseManager = async (serverUrl, databaseName) => {
  return await databaseManager.getDatabaseManager(serverUrl, databaseName)
};