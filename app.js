var express = require("express");
var app = express();
var Promise = require("es6-promise").Promise;
var book = require("./models/book");
var Book = book.Book;

var template = require("./template");
var Page = require("./page").Page;

var bodyParser = require('body-parser')();
var formidable = require("formidable");

app.use(express.static("static/"));
//If we have a 404 on a image, we load a placeholder.
app.get("/images/*", function(req, res){
    //we look into another directory to avoid infinite loop if placeholder is not there
    res.redirect("/assets/notfound.png");
});

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

    Book.put(req.params.isbn, book_data).then(function(){
        res.redirect("/book/"+req.params.isbn);
    });
});

var fs = require("fs");
app.post("/book/:isbn/image/", function(req,res,next){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        if(err){
            next();
            return;
        }
        req.body = fields;
        req.files = files;
        next();
    });
}, function(req,res){
    var file = req.files.cover.path;
    fs.rename(file,"static/images/"+req.params.isbn+".png", function(err){
        if(err){
            console.log(err);
            res.send(500);
            return;
        }
        res.redirect("/book/"+req.params.isbn);
    });
});

app.listen(8080);