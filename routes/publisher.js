var Promise = require("es6-promise").Promise;
var database = require("./../database");
var Publisher = require("./../models/publisher").Publisher;

var bodyParser = require("body-parser");
var formidable = require("formidable");
var template = require("./../template");
var Page = require("./../page").Page;

module.exports = function(router){
    router.get("/publishers/", function(req, res){
        var tpl = template.loadTemplate("publishers");
        var page = new Page("basic");
        Publisher.getList()
            .then(function(list){
                return tpl.then(function(tmpl){ return tmpl(list); });
            })
            .then(function(body){
                page.setContent("body", body).render(res);
            });

    });

    router.get("/publisher/", function(req,res){
        var tpl = template.loadTemplate("publisher_form");
        var page = new Page("basic");
        tpl.then(function(tmpl){
            return tmpl();
        }).then(function(body){
                page.setContent("body", body).render(res);
        });
    });

    router.get("/publisher/:id", function(req, res){

        var publisher = new Publisher(new database.ObjectID(req.params.id));
        var tmpl = template.loadTemplate("publisher_form");
        var page = new Page("basic");
        publisher.getData().then(function(data){
            console.log(data);
            return tmpl.then(function(tpl){ return tpl(data); })
        }).then(function(body){
            page.setContent("body", body).render(res);
        });
    });

    router.post("/publisher/:id?",function(req,res,next){
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
        var publisher;
        if(req.params.id){
            publisher = new Publisher(new database.ObjectID(req.params.id));
        } else {
            publisher = new Publisher();
        }
        publisher.setName(req.param("publisher_name"));
        var isbn = req.param("publisher_isbn").split(",");
        isbn.forEach(function(item){
            publisher.addISBNKey(item.trim());
        });

        publisher.save().then(function(){
            res.redirect("/publishers/");
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