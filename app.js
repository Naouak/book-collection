var express = require("express");
var app = express();
var Promise = require("es6-promise").Promise;
var book = require("./models/book");
var Book = book.Book;

var template = require("./template");
var Page = require("./page").Page;
var booksTemplate = template.loadTemplate("books");

var page = new Page("basic");

app.get("/", function(req, res){
    var response_send = function(data){
        booksTemplate.then(function(tmpl){
            page.setContent("body",tmpl({
                    books: data
            })).render(res);
        });
    };

    if(req.xhr){
        response_send = function(){
            res.send.call(res,arguments);
        };
    }

    book.getBookList().then(function(books){
        var arr = [];

        books.reduce(function(promise, result){
            return promise
                .then(function(){
                    return result.getData();
                })
                .then(function(book_data){
                    console.log(book_data);
                    arr.push(book_data);
                });
        },Promise.resolve()).then(function(){
            response_send(arr);
        });

    }, response_send);
});

app.get("/book/:isbn", function(req,res){
    var book = new Book(req.params.isbn);
    book.load().then(function(data){
        res.send(data);
    }, res.send);
});

app.listen(8080);