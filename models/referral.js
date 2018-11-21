var mongoose = require('mongoose');
var Schema  = mongoose.Schema;

var referralSchema = new Schema({
    referralCodegen  : {type:String,trim:true},
    referralCodeval  : {type:String,trim:true},
});

var Referral = mongoose.model('Referral',referralSchema);
module.exports = Referral;