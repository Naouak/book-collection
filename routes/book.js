var Promise = require("es6-promise").Promise;
var Page = require("./../page").Page;
var book = require("../models/book");
var Book = book.Book;
var template = require("./../template");
var bodyParser = require("body-parser");
var formidable = require("formidable");

module.exports = function(router){
    //Basic page for book addition/edition.
    router.get("/book/:isbn?", function(req,res){
        var bookAddTpl = template.loadTemplate("book_form");
        var page = new Page("basic");
        var sequence = Promise.resolve();
        if(req.params.isbn){
            var book = new Book(req.params.isbn);
            sequence = book.load();
        }
        sequence.then(function(data){
            bookAddTpl.then(function(tmpl){
                page.setContent("body",tmpl(data)).render(res);
            }, function(err){
                page.setContent("body",err).render(res);
            });
        }, res.send);
    });

    router.post("/book/:isbn?", function(req,res,next){
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
    }, book.dataMiddleware, function(req,res){
        var sequence;
        if(req.params.isbn){
            sequence = Book.put(req.params.isbn, req.book_data);
        } else {
            sequence = Book.post(req.book_data);
        }
        sequence.then(function(){
            res.redirect("/book/"+req.book_data.isbn);
        }).catch(function(err){
            res.send(err);
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