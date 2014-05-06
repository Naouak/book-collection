var fs = require("fs");
var Micro = require("yui/template-micro").Template.Micro;
var micro = Micro;

var Promise = require("es6-promise").Promise;

module.exports.loadTemplate = function(name){
    var path = "templates/"+name+".html";
    return new Promise(function(resolve, reject){
        fs.readFile(path, {encoding: "utf-8"}, function(err, data){
            err?reject(err):resolve(data);
        });
    }).then(function(data){
        //We got the template Data (Yayifications) !
        return micro.compile(data);
    });
};