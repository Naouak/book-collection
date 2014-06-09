var Serie = module.exports = require("./model")("serie");
var book = require("./book");

Serie.prototype._afterSave = function(data){
    var book_data = {
        _id: data._id,
        name: data.name
    };
    book.getBookList({"serie._id":data._id}).then(function(books){
        books.forEach(function(item){
            item.setSerie(book_data);
        });
    });

    return data;
};