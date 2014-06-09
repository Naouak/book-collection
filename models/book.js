var Promise = require("es6-promise").Promise;

var database = require("../database");
var Publisher = require("./publisher").Publisher;
var bookCollection = database.getCollection("books");

/**
 * Book Object
 * A way to load and save books.
 * @param isbn
 * @constructor
 */

//Need to add the isbn after the url to load a book.
//var google_api_url = "https://www.googleapis.com/books/v1/volumes?q=isbn:";

var Book = module.exports.Book = require("./model")("books","isbn");

Book.prototype.setPublisher = function(publisher){
    this._data.publisher = publisher;
    return this;
};

Book.prototype.setSerie = function(serie){
    this._data.serie = serie;
    return this;
};


Book.get = function(isbn){
    return new Book(isbn).load();
};

Book.put = function(isbn,book_data){
    //As we use an upsert to do posting, we can use it for put too.
    return Book.post(book_data, isbn);
};

Book.post = function(book_data, isbn){
   return bookCollection.then(function(collection){
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
    return bookCollection.then(function(collection){
        return new Promise(function(resolve, reject){
            collection.remove({"isbn": isbn}, function(err){
                err?reject(err):resolve();
            });
        });
    });
};

module.exports.getBookList = function(find){
    find = find || {};
    return new Promise(function(resolve, reject){
        bookCollection.then(function(collection){
            collection.find(find).toArray(function(err, results){
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

/**
 * Simple middleware to factorize fetching book_data from a query.
 * @param req
 * @param res
 * @param next
 */
module.exports.dataMiddleware = function(req,res,next){
    var book_data = {};
    book_data.isbn = req.param("isbn");
    book_data.title = req.param("title");
    book_data.volume = req.param("volume");
    book_data.status = req.param("status");
    book_data.publisher = req.param("publisher");

    if(book_data.publisher == "0"){
        publisher = new Publisher();
        publisher.setName(req.param("new_publisher_name"));
        publisher.addISBNKey(book_data.isbn.substr(5,4));
        publisher.save().then(function(){
            book_data.publisher = {
                _id: publisher.getData(true)._id,
                name: publisher.getData(true).name
            };
            req.book_data = book_data;
            next();

        });
    } else {
        publisher = new Publisher(book_data.publisher);
        publisher.load().then(function(data){
           book_data.publisher = {
               _id: data._id,
               name: data.name
           };
           req.book_data = book_data;
           next();
        });
    }
};