var database = require("./../database");

module.exports = function(collection_name, id_column){
    id_column = id_column || "_id";
    var collectionPromise = database.getCollection(collection_name);

    var Model = function(_id, data){
        this._id = _id;
        this._data = data || {};
    };

    Model.prototype.load = function(cache, force){
        force = force || false;
        //If we have already loaded this object we may want to reuse it.
        this._loadPromise =
            (force?false:this._loadPromise)
            ||
            collectionPromise.then(function(collection){
                return new Promise(function(resolve, reject){
                    var query = {};
                    query[id_column] = this._id;
                    collection.findOne(query,function(err,result){
                        if(err){
                            reject(err);
                            return;
                        }
                        this._data = result;
                        resolve(result);
                    }.bind(this));
                }.bind(this));
            }.bind(this));

        return this._loadPromise;
    };

    Model.prototype.save = function(){
        var query = undefined;
        if(this._id){
            query = {};
            query[id_column] = this._id;
        } else {
            //Okay, I'm a bit ashamed of that for now
            //@todo Be proud of that hack
            //BTW this is just a query that should never match any element so that find and modify create a new object.
            query = { "saehrtwhefioheiothiohvuhwoifhiosjhgioe4jioj" : "ajsdlk;fjklwe;jfklsjdklfj"};
        }

        var promise = collectionPromise.then(function(collection){
            return new Promise(function(resolve, reject){
                collection.findAndModify(
                    query,
                    null,
                    this._data,
                    {
                        upsert: true,
                        new: true
                    },
                    function(err, document){
                        if(err){
                            reject(err);
                            return;
                        }
                        this._data = document;
                        resolve(this._data);
                    }.bind(this)
                );
            }.bind(this));
        }.bind(this));

        if(this._afterSave instanceof Function){
            promise = promise.then(this._afterSave);
        }

        return promise;
    };

    this.getData = function(fromCache){
        return fromCache?this._data:this.load();
    };

    return Model;
};