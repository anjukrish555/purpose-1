var mongoose = require('mongoose');
var Schema  = mongoose.Schema;

var resourceSchema = new Schema({
    website : {type:String,trim:true},
    description : {type:String,trim:true},
    name : {type:String,trim:true},
    image : {type:String,trim:true},
    category : {type:String,trim:true},
});

var Resource = mongoose.model('resource',resourceSchema);
module.exports = Resource;