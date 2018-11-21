var mongoose = require('mongoose');
var Schema   = mongoose.Schema;


var userSchema = new Schema({
	fullname 	 : {type:String,required:true,unique:false,trim:true},
	username 	 : {type:String,trim:true,default:""},
	email    	 : {type:String,required:true,unique:true,trim:true},
	password 	 : {type:String,default:""},
	image        : {type:String,default:"https://unsplash.it/200/200"},
	bio          : {type:String,default:""},
	status   	 : {type:String,default:0},
    role         : {type:String},
	accountToken : {type:String},
	resetToken   : {type:String},
	expireToken  : {type:Date},
	followers    : Array,
	following    : Array,
	likes        : {type:Number,default:0},
	posts        : [{
					  post : String,
					  body : {type:String,trim:true},
					  image : {type:String,trim:true},
					  video : {type:String,trim:true},
					}],
});


var User = mongoose.model('User',userSchema);

module.exports = User;
