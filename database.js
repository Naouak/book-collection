var config = require("config");
var Promise = require("es6-promise").Promise;
var MongoClient = require('mongodb').MongoClient;

//Lets use a promise for database connection, it will be better for chaining operation on database.
module.exports.db = new Promise(function(resolve,reject){
    MongoClient.connect(config.database.uri, function(err, db){
        if(err){
            reject(err);
        }
        resolve(db);
    });
});

