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

module.exports.find = function(collection, find_params){
    return new Promise(function(resolve, reject){
        module.exports.getCollection(collection).then(function(collection){
            collection.find(find_params).toArray(function(err, results){
                if(err){
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });
    });
}

module.exports.ObjectID = require("mongodb").ObjectID;

