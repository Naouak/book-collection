var Promise = require("es6-promise").Promise;
var https = require("https");

var database = require("../database");

/**
 * Book Object
 * A way to load and save books.
 * @param isbn
 * @constructor
 */

//Need to add the isbn after the url to load a book.
var google_api_url = "https://www.googleapis.com/books/v1/volumes?q=isbn:";

module.exports.Book = function(isbn){
    var data = null;
    //A shorthand to avoid scope confusion.
    var that = this;
    //To avoid loading the same thing twice. Let's do a singleton.
    var loadPromise;
    this.load = function(){
        loadPromise = loadPromise || new Promise(function(resolve, reject){
            database.getCollection("books").then(function(collection){
                collection.findOne({"isbn":isbn},function(err,result){
                    if(err){
                        reject(err);
                        return;
                    }

                    resolve(result);
                });
            },reject);
        });
        return loadPromise;
    };

    this.getData = function(){
        //A simple promise that will load the content if not already loaded.
        return new Promise(function(resolve, reject){
            if(data){
                return resolve(data);
            }
            that.load().then(resolve(result), reject(err));
            return null;
        });
    }
};