var Promise = require("es6-promise").Promise;
var https = require("https");

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
            https.get(google_api_url+isbn,
                function(res){
                    var current_data = "";
                    res.on("data", function(chunk){
                        current_data += chunk;
                    });
                    res.on("end", function(){
                        resolve(JSON.parse(current_data));
                    });
                }
            ).on("error", function(e){
                reject(e);
            });
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