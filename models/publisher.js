/**
 * Created by Naouak on 16/05/14.
 */
var Promise = require("es6-promise").Promise;

var database = require("../database");

var publisherCollection = database.getCollection("publisher");

var Publisher = module.exports.Publisher = function(_id,data){
    if(_id && !(_id instanceof database.ObjectID)){
        _id = new database.ObjectID(_id);
    }
    //No data given so we may initialize the data object
    if(data == undefined){
        data = {
            name: null,
            isbn:[]
        };
    }

    //To avoid loading the same thing twice. Let's do a singleton.
    var loadPromise;
    this.load = function(){
        loadPromise = loadPromise || new Promise(function(resolve, reject){
            publisherCollection.then(function(collection){
                collection.findOne({"_id":_id},function(err,result){
                    if(err){
                        reject(err);
                        return;
                    }
                    data = result;
                    resolve(result);
                });
            },reject);
        });
        return loadPromise;
    };

    this.getData = function(fromCache){
        if(fromCache){
            return data;
        }
        //A shorthand to avoid scope confusion.
        var that = this;
        //A simple promise that will load the content if not already loaded.
        return new Promise(function(resolve, reject){
            that.load().then(resolve, reject);
            return null;
        });
    };

    this.setName = function(name){
        data.name = name;
        return this;
    };

    this.addISBNKey = function(isbnKey){
        data.isbn.push(isbnKey);
        data.isbn = data.isbn.reduce(function(arr,item){ if(arr.indexOf(item) < 0){ arr.push(item); } return arr; },[]);
        return this;
    };

    this.save = function(){
        var query = undefined;
        if(_id){
            query = { _id: _id };
        } else {
            query = { name: data.name }
        }

        return new Promise(function(resolve, reject){
            publisherCollection.then(function(collection){
                collection.findAndModify(
                    query,
                    null,
                    data,
                    {
                        upsert: true,
                        new: true
                    },
                    function(err, document){
                        if(err){
                            reject(err);
                            return;
                        }
                        data = document;
                        resolve();
                    }
                );
            });
        });
    };
};

Publisher.getList = function(){
    return database.find("publisher").then(function(publishers){
        var arr = [];
        for(var i = 0; i < publishers.length; i++){
            arr.push(new Publisher(publishers[i]._id, publishers[i]));
        }
        return arr;
    });
};

Publisher.getPublisherByISBNKey = function(isbnKey){
    return publisherCollection.then(function(collection){
        return new Promise(function(resolve, reject){
            collection.find({isbn:isbnKey}).toArray(function(err,documents){
                if(err){
                    reject(err);
                    return;
                }
                if(documents.length==0){
                    reject(404);
                    return;
                }

                resolve(new Publisher(documents[0]._id,documents[0]));
            });
        });
    });
};