//This file is created to do a quick add of a publisher to do some testing with publisher related functions.

var Publisher = require("./models/publisher").Publisher;

var publisher = new Publisher();
publisher.addISBNKey(1892).setName("Doki Doki").save().then(function(){
    console.log("great success!");
}, function(err){
    console.log("too bad man");
    console.log(err);
});