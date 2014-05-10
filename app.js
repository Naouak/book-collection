var express = require("express");
var app = express();
var Promise = require("es6-promise").Promise;
var book = require("./models/book");
var Book = book.Book;

var template = require("./template");
var Page = require("./page").Page;

var bodyParser = require('body-parser')();

app.use(express.static("static/"));

app.get("/", function(req, res){
    var page = new Page("basic");
    var booksTemplate = template.loadTemplate("books");

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

//Basic page for book addition.
app.get("/book/", function(req,res){
    var bookAddTpl = template.loadTemplate("book_form");
    var page = new Page("basic");
    bookAddTpl.then(function(tmpl){
        page.setContent("body",tmpl()).render(res);
    }, function(err){
        page.setContent("body",err).render(res);
    });
});

app.post("/book/", bodyParser, function(req,res){
    var book_data = {};
    book_data.isbn = req.param("isbn");
    book_data.title = req.param("title");
    book_data.volume = req.param("volume");

    Book.post(book_data).then(function(){
        res.redirect("/");
    }, function(err){
        console.log(err);
        res.send(500);
    });
});

app.get("/book/:isbn", function(req,res){
    var bookAddTpl = template.loadTemplate("book_form");
    var page = new Page("basic");
    var book = new Book(req.params.isbn);
    book.load().then(function(data){
        bookAddTpl.then(function(tmpl){
            page.setContent("body",tmpl(data)).render(res);
        }, function(err){
            page.setContent("body",err).render(res);
        });
    }, res.send);
});

app.post("/book/:isbn", bodyParser, function(req,res){
    var book_data = {};
    book_data.isbn = req.param("isbn");
    book_data.title = req.param("title");
    book_data.volume = req.param("volume");

    Book.put(req.params.isbn, book_data).then(res.redirect("/book/"+req.params.isbn));
});

app.listen(8080);