var config = require("./config");
var Promise = require("es6-promise").Promise;
var MongoClient = require('mongodb').MongoClient;

//Lets use a promise for database connection, it will be better for chaining operation on database.
var db = module.exports.db = new Promise(function(resolve,reject){
    MongoClient.connect(config.database.uri, function(err, db){
        console.log("connected");
        if(err){
            reject(err);
        }
        resolve(db);
    });
});

module.exports.getCollection = function(name){
    return new Promise(function(resolve,reject){
        db.then(function(db){
            resolve(db.collection(name));
        },reject);
    });
};

