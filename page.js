var template = require("./template");

var Page = module.exports.Page = function(root_template){
    var root = template.loadTemplate(root_template);

    var contents = {

    };

    this.setContent = function(position, content){
        contents[position] = content;
        return this;
    };

    this.render = function(response){
        return root.then(function(tmpl){
            return tmpl(contents);
        }).then(function(html){
            response.send(html);
        }, function(err){
            response.send(500);
        });
    }
}