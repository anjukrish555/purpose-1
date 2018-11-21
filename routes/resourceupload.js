var express = require('express');
var router = express.Router();
var async = require('async');
var path = require('path');
var passport = require('passport');
var cloudinary = require('cloudinary');
var User = require('../models/user');
var Resource = require('../models/resource');
var db   = require('../secure/db');
fs = require('fs'),

    router.get('/resourceupload',function(req,res,next){
        User.find({_id: {$ne: req.user._id}},(err,user) => {
            if(err) throw err;
            if(user)
            {
                db.findAll(Resource)
                    .then(function(data){
                        res.render('resourceupload',{title:"Steel Smiling",user:req.user,header:true,navbar:true,resources:data});
                    })
                    .catch(function(err){
                        next(err);
                    });
            }
            else {
                throw(err);
            }
        });
    });


module.exports=router;