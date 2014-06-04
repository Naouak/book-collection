/**
 * Created by Naouak on 16/05/14.
 */
var Promise = require("es6-promise").Promise;

var database = require("../database");
var bookModel = require("./book");
var publisherCollection = database.getCollection("publisher");

var Publisher = module.exports.Publisher = require("./model")("publisher");

Publisher.prototype.setName = function(name){
    this._data.name = name;
    return this;
};

Publisher.prototype.addISBNKey = function(isbnKey){
    this._data.isbn = this._data.isbn || [];
    this._data.isbn.push(isbnKey);
    this._data.isbn = data.isbn.reduce(function(arr,item){ if(arr.indexOf(item) < 0){ arr.push(item); } return arr; },[]);
    return this;
};

Publisher.prototype._afterSave = function(data){
    //Update of all the publishers in the books.
    var _id = data._id;
    var pub = {
        _id: data._id,
        name: data.name
    };

    //Can probably do it with a single mongodb query.
    //@todo mass update of a model
    bookModel.getBookList({
        "publisher._id": _id
    }).then(function(books){
        return books.reduce(function(sequence, item){
            return sequence.then(function(){
                return item.setPublisher(pub).save();
            });
        },Promise.resolve());
    });
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