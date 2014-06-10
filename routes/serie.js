var Promise = require("es6-promise").Promise;
var Page = require("./../page").Page;
var Serie = require("../models/serie");
var Publisher = require("../models/publisher").Publisher;
var template = require("./../template");
var formidable = require("formidable");

module.exports = function(router){
    //Basic page for book addition/edition.
    router.get("/serie/:id?", function(req,res){
        var serieAddTpl = template.loadTemplate("serie_form");
        var page = new Page("basic");
        var sequence = Promise.resolve();
        var publisherList = [];

        //Loading publisherList for form.
        sequence = sequence.then(function(){
            return Publisher.getList();
        }).then(function(list){
            publisherList = list;
        });

        if(req.params.id){
            var serie = new Serie(req.params.id);
            sequence = sequence.then(function(){
                return serie.load();
            });
        }

        sequence = sequence.then(function(data){
            data = data || {};
            data.publisherList = publisherList;
            serieAddTpl.then(function(tmpl){
                page.setContent("body",tmpl(data)).render(res);
            }, function(err){
                page.setContent("body",err).render(res);
            });
        }, res.send);
    });

    router.post("/serie/:id?", function(req,res,next){
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
    }, Serie.dataMiddleware, function(req,res){
        var sequence = Promise.resolve();

       //@Todo Create/Saving a serie
    });

};