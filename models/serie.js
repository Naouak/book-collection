var Serie = module.exports = require("./model")("serie");

Serie.prototype._afterSave = function(data){
    //@Todo update related books.
};