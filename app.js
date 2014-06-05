var express = require("express");
var app = express();
var Promise = require("es6-promise").Promise;
var book = require("./models/book");

var template = require("./template");
var Page = require("./page").Page;

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
                    states: {
                        "read": "Livres lus",
                        "order": "Livres à commander",
                        "queue": "Livres en attente de lecture",
                        "reading": "Livres en cours de lecture",
                        "rereading": "Livres en cours de relecture"
                    },
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
                    arr.push(book_data);
                });
        },Promise.resolve()).then(function(){
            //Here we will group books by reading state.
            var book_by_state = {};
            arr.forEach(function(item){
                if(book_by_state[item.status] === undefined){
                    book_by_state[item.status] = [];
                }

                book_by_state[item.status].push(item);
            });
            return book_by_state;
        }).then(function(book_by_state){
            response_send(book_by_state);
        });

    }, response_send);
});

//Addings routes for books.
require("./routes/book")(app);
require("./routes/publisher")(app);

app.listen(8080);