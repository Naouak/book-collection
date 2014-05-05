var express = require("express");
var app = express();
var Promise = require("es6-promise").Promise;
var book = require("./models/book");
var Book = book.Book;

app.get("/", function(req, res){
    console.log("test");
    book.getBookList().then(function(books){
        var arr = [];

        books.reduce(function(promise, result){
            return promise
                .then(function(){
                    console.log("GET DATA");
                    return result.getData();
                })
                .then(function(book_data){
                    console.log(book_data);
                    arr.push(book_data);
                });
        },Promise.resolve()).then(function(){
            res.send(arr);
        });

    }, res.send);
});

app.get("/book/:isbn", function(req,res){
    var book = new Book(req.params.isbn);
    book.load().then(function(data){
        res.send(data);
    }, res.send);
});

app.listen(8080);