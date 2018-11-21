var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Message = require('../models/message');

router.get('/messages',function(req,res,next){
    User.find({_id: {$ne: req.user._id}},(err,user) => {
        if(err) throw err;
        if(user) res.render('messages',{title:"Steel Smiling",header:true,navbar:true,user:user});
    });

});

router.post('/send',function(req,res,next){

    if(!req.body.receiver){
        return res.send({success:false,msg:"Select receiver from users list."});
    }

    if(req.body.message == ""){
        return res.send({success:false,msg:"Please enter your message."});
    }



    var newMessage = new Message();
    newMessage.message = req.body.message;
    newMessage.receiver = req.body.receiver;
    newMessage.sender = req.body.sender;
    newMessage.save((err,data) => {
        res.send({success:true,data:data});
    });
});

router.post('/getMessage',function(req,res){
    receiver = req.body.receiver;
   // console.log(receiver);
    Message.find(
        {$or:[
                {sender:req.body.sender,receiver:receiver},
                {sender:receiver,receiver:req.body.sender}
            ]
        },
        (err,data) => {
           // console.log(data);
            res.send({success:true,data:data});
        }
    );

});

module.exports = router;