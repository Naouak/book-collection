var express = require("express");
var app = express();
var Promise = require("es6-promise").Promise;
var book = require("./models/book");
var Book = book.Book;

var template = require("./template");

var mainTemplate = template.loadTemplate("basic");
var booksTemplate = template.loadTemplate("books");

app.get("/", function(req, res){
    var response_send = function(data){
        //Here is the template.
        //But for now we will just use res.send;
        var body = "";
        booksTemplate.then(function(tmpl){
            body = tmpl({
                books: data
            });
        }).then(function(){return mainTemplate;}).then(function(tmpl){
                res.send(tmpl({
                    body: body
                }));
            }
        );
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