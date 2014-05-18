var Promise = require("es6-promise").Promise;
var database = require("./../database");

module.exports = function(router){
    router.get("/publishers/", function(req, res){
        database.find("publishers").then(function(publishers){
            //@todo render templates with publisher list.
        });
    });
};