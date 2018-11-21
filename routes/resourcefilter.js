var express = require('express');
var router = express.Router();
var async = require('async');
var path = require('path');
var passport = require('passport');
var cloudinary = require('cloudinary');
var User = require('../models/user');
var Resource = require('../models/resource');
var multer = require('multer');
var middleware = require('../middlewares/middleware');
var db   = require('../secure/db');
fs = require('fs'),

    router.post('/filterresources',function(req,res,next){
        var category = req.body.category;
        User.find({_id: {$ne: req.user._id}},(err,user) => {
            if(err) throw err;
            if(user)
            {
                var user = req.user._id;
                db.findAll(Resource,{category:category})
                    .then(function(data){
                        res.send({msg: data, success: true,user: user });
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