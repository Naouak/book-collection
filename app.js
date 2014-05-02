var express = require("express");
var app = express();

var Book = require("./models/book").Book;
var book = new Book("9782818924624");

app.get("/", function(req,res){

    book.load().then(function(data){
        res.send(data);
    }, function(err){
        console.log("Something has gone wrong");
        res.send(err);
    });
});

app.listen(8080);