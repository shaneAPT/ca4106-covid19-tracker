var url = require('url');

module.exports = function(config) {

  var gcloud = require('google-cloud');

  var datastore = gcloud.datastore({ 
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  function getAllCounties(callback) {
    var query = datastore.createQuery(['County']);
    datastore.runQuery(query, (err, counties) => callback(err, counties, datastore.KEY));                                                   
  }

  return {
    getAllCounties: getAllCounties
  };
};
