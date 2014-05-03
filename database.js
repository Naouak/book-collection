var Promise = require("es6-promise").Promise;
var MongoClient = require('mongodb').MongoClient;

//Lets use a promise for database connection, it will be better for chaining operation on database.
module.exports.db = new Promise(function(resolve,reject){
    MongoClient.connect("mongodb://127.0.0.1:27017/book-collection", function(err, db){
        if(err){
            reject(err);
        }
        resolve(db);
    });
});

