/**
 * Created by Naouak on 16/05/14.
 */
var Promise = require("es6-promise").Promise;

var database = require("../database");

var Publisher = module.exports.Publisher = function(name,data){
    //A shorthand to avoid scope confusion.
    var that = this;
    //To avoid loading the same thing twice. Let's do a singleton.
    var loadPromise;
    this.load = function(){
        loadPromise = loadPromise || new Promise(function(resolve, reject){
            database.getCollection("publisher").then(function(collection){
                collection.findOne({"name":name},function(err,result){
                    if(err){
                        reject(err);
                        return;
                    }
                    data = result;
                    resolve(result);
                });
            },reject);
        });
        return loadPromise;
    };

    this.getData = function(){
        //A simple promise that will load the content if not already loaded.
        return new Promise(function(resolve, reject){
            if(data){
                return resolve(data);
            }
            that.load().then(resolve(result), reject(err));
            return null;
        });
    }
};