var Promise = require("es6-promise").Promise;
var database = require("./../database");
var Publisher = require("./../models/publisher").Publisher;

module.exports = function(router){
    router.get("/publishers/", function(req, res){
        database.find("publishers").then(function(publishers){
            //@todo render templates with publisher list.
        });
    });

    router.get("/publisher/isbn/:isbn", function(req,res){
        console.log(req.params.isbn);
         Publisher.getPublisherByISBNKey(req.params.isbn).then(function(publisher){
                publisher.getData().then(function(data){
                    res.send(data);
                });
         }, function(err){
             console.log(err);
             res.send(err);
         });
    });
};