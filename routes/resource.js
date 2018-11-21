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

    cloudinary.config({
        cloud_name: 'dvcyyvow1',
        api_key: '657527449877227',
        api_secret: '2MwCI1QCm2hedSdtyD3kkhPVZxw'
    });

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname,'../public/images/resources'))
    },
    filename: function (req, file, cb) {
        cb(null, req.user.fullname + '-' + Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        var types = ['image/jpeg','image/png'];
        type  = types.find(type => type == file.mimetype);

        if(!type){
            return cb(null,false);
        }

        return cb(null,true);

    }
});

router.get('/resource',function(req,res,next){
    User.find({_id: {$ne: req.user._id}},(err,user) => {
        if(err) throw err;
        if(user)
        {
            db.findAll(Resource)
                .then(function(data){
                    res.render('resource',{title:"Steel Smiling",user:req.user,header:true,navbar:true,resources:data});
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


router.post('/saveresource', upload.single('upload'),function(req,res,next) {
    var name = req.body.name;
    var description = req.body.description;
    var website = req.body. website;
    var category = req.body.category;
    var file = req.file;
    console.log(category);
    if(!req.body.name){
        return res.send({success:false,msg:"Organization name is required."});
    }
    if(req.body.category == "Select a location:"){
        return res.send({success:false,msg:"Location is required."});
    }
    if(req.body.website == ""){
        return res.send({success:false,msg:"Website/hyperlink is required."});
    }
    if(file){
        cloudinary.uploader.upload("./public/images/resources/" + file.filename, function (result) {
            file.filename = result.secure_url;
            async.waterfall([
                function (callback) {
                    var newResource = new Resource();
                    newResource.image = file.filename;
                    newResource.name = name;
                    newResource.description = description;
                    newResource.website = website;
                    newResource.category = category;
                    newResource.save((err, data) => {
                        if (err) res.send({msg: "Something went wrong", success: false});
                        if (data) callback(null, data);
                    });
                },
            ]);
        });
    }
    else{
        return res.send({success:false,msg:"Logo is required."});
    }
});

module.exports=router;