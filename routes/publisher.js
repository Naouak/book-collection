var Promise = require("es6-promise").Promise;
var database = require("./../database");
var Publisher = require("./../models/publisher").Publisher;

var template = require("./../template");
var Page = require("./../page").Page;

module.exports = function(router){
    router.get("/publishers/", function(req, res){
        database.find("publishers").then(function(publishers){
            //@todo render templates with publisher list.
        });
    });

    router.get("/publisher/isbn/:isbn", function(req,res){
        var tpl = template.loadTemplate("publisher");
        var page = new Page("basic");
        Publisher.getPublisherByISBNKey(req.params.isbn).then(function(publisher){
            return publisher.getData()
        }).then(function(data){
            return tpl.then(function(tmpl){return tmpl(data);});
        }).then(function(content){
            page.setContent("body",content).render(res);
        });
    });
};