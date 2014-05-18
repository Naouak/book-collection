var Promise = require("es6-promise").Promise;
var Page = require("./../page").Page;
var book = require("../models/book");
var Book = book.Book;
var template = require("./../template");

module.exports = function(router){
    //Basic page for book addition.
    router.get("/book/", function(req,res){
        var bookAddTpl = template.loadTemplate("book_form");
        var page = new Page("basic");
        bookAddTpl.then(function(tmpl){
            page.setContent("body",tmpl()).render(res);
        }, function(err){
            page.setContent("body",err).render(res);
        });
    });

    router.post("/book/", bodyParser, book.dataMiddleware, function(req,res){
        Book.post(req.book_data).then(function(){
            res.redirect("/");
        }, function(err){
            console.log(err);
            res.send(500);
        });
    });

    router.get("/book/:isbn", function(req,res){
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

    router.post("/book/:isbn", bodyParser, book.dataMiddleware, function(req,res){
        Book.put(req.params.isbn, req.book_data).then(function(){
            res.redirect("/book/"+req.params.isbn);
        });
    });

    var fs = require("fs");
    router.post("/book/:isbn/image/", function(req,res,next){
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


};