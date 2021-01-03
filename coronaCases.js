/*
   Template from https://codelabs.developers.google.com/codelabs/cloud-nodejs/#0  
*/

var url = require('url');

module.exports = function(config) {

  var gcloud = require('google-cloud');

  var datastore = gcloud.datastore({ 
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  function getAllCoronaCases(callback) {
    var query = datastore.createQuery(['CoronaCase']);
    datastore.runQuery(query, (err, coronaCases) => callback(err, coronaCases, datastore.KEY));                                                   
  }

  function addCoronaCase(location, status, callback) {
    var entity = {
      key: datastore.key('CoronaCase'),
      data: {
        location: location,
        status: status
      }
    };

    datastore.save(entity, callback);                                               
  }

  return {
    getAllCoronaCases: getAllCoronaCases,
    addCoronaCase: addCoronaCase
  };
};
