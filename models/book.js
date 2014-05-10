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

var Book = module.exports.Book = function(isbn,data){
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
                    data = result;
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

Book.get = function(isbn){
    return new Book(isbn).load();
};

Book.put = function(isbn,book_data){
    //As we use an upsert to do posting, we can use it for put too.
    return Book.post(book_data, isbn);
};

Book.post = function(book_data, isbn){
   return database.getCollection("books").then(function(collection){
        return new Promise(function(resolve, reject){
            collection.update({
                "isbn": isbn?isbn:book_data.isbn
            }, book_data, {
                upsert: true,
                multi: false
            }, function(err){
                err?reject(err):resolve();
            });
        });
    });
};

Book["delete"] = function(isbn){
    return database.getCollection("books").then(function(collection){
        return new Promise(function(resolve, reject){
            collection.remove({"isbn": isbn}, function(err){
                err?reject(err):resolve();
            });
        });
    });
};

module.exports.getBookList = function(){
    console.log("booklist");
    return new Promise(function(resolve, reject){
        console.log("booklist");
        database.getCollection("books").then(function(collection){
            collection.find().toArray(function(err, results){
                console.log("booklist");
                if(err){
                    reject(err);
                    return;
                }

                var i, books = [];
                for(i=0; i < results.length; i++){
                    books.push(new module.exports.Book(results[i].isbn, results[i]));
                }
                resolve(books);
            });
        });
    });
};