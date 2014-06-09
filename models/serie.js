var Serie = module.exports = require("./model")("serie");
var book = require("./book");
var Promise = require("es6-promise").Promise;

Serie.prototype._afterSave = function(data){
    var book_data = {
        _id: data._id,
        name: data.name
    };
    book.getBookList({"serie._id":data._id}).then(function(books){
        books.reduce(function(promise, item){
            return promise.then(function(){item.setSerie(book_data).save();});
        }, Promise.resolve());
    });

    return data;
};