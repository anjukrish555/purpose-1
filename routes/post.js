var express = require('express');
var router = express.Router();
var async = require('async');
var path = require('path');
var multer = require('multer');
var cloudinary = require('cloudinary');

cloudinary.config({
	cloud_name: 'dvcyyvow1',
	api_key: '657527449877227',
	api_secret: '2MwCI1QCm2hedSdtyD3kkhPVZxw'
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,'../public/images/posts'))
  },
  filename: function (req, file, cb) {
    cb(null, req.user.fullname + '-' + Date.now() + path.extname(file.originalname))
  }
});

var upload = multer({
		storage: storage,
		fileFilter: function (req, file, cb) {
				var types = ['image/jpeg','image/png','video/mp4'];
		            type  = types.find(type => type == file.mimetype);

		          	if(!type){
		          		return cb(null,false);
		          	}

		          	return cb(null,true);

    	}
});

//importing models
var User = require('../models/user');
var Post = require('../models/post');
var Notification = require('../models/notification');
var db   = require('../secure/db');



/*GET post*/
router.get('/post/:id',function(req,res,next){
  	db.findData(Post,{_id:req.params.id})
  	  .then(function(data){
  	  		res.render('post',{title:"Steel Smiling",user:req.user,header:true,navbar:true,posts:[data],single:true});
  	  })
  	  .catch(function(err){
  	  	  next(err);
  	  });
});

/* POST save */
router.post('/savepost',upload.single('upload'),function(req,res,next) {
    var body = req.body.body;
    var file = req.file;
    var userdata = {userID: req.user._id, fullname: req.user.fullname, image: req.user.image};
    if(file && file.mimetype=='image/jpeg'){
    cloudinary.uploader.upload("./public/images/posts/" + file.filename, function (result) {
        console.log(result.secure_url);
        file.filename = result.secure_url;
        console.log(file.filename);
        async.waterfall([
            function (callback) {
                var newPost = new Post();
                newPost.body = body.trim();
                newPost.image = file.filename;
                newPost.owner = userdata;
                newPost.save((err, data) => {
                    if (err) res.send({msg: "Something went wrong", success: false});
                    if (data) callback(null, data);
                });
            },
            function (data, callback) {
                User.findOneAndUpdate(
                    {_id: req.user._id},
                    {
                        $push:
                            {
                                posts: {
                                    post: data._id,
                                    body: data.body,
                                    image: data.image
                                }
                            }
                    },
                    (err, user) => {
                        if (err) res.send({msg: "Something went wrong", success: false});
                        if (user) res.send({msg: "Data Saved", post: data, success: true});
                    }
                );
            }
        ]);
    });
}
else if(file && file.mimetype=='video/mp4'){
        cloudinary.uploader.upload("./public/images/posts/" + file.filename, function (result) {
            file.filename = result.secure_url;
            async.waterfall([
                function (callback) {
                    var newPost = new Post();
                    newPost.body = body.trim();
                    newPost.video = file.filename;
                    newPost.owner = userdata;
                    newPost.save((err, data) => {
                        if (err) res.send({msg: "Something went wrong", success: false});
                        if (data) callback(null, data);
                    });
                },
                function (data, callback) {
                    User.findOneAndUpdate(
                        {_id: req.user._id},
                        {
                            $push:
                                {
                                    posts: {
                                        post: data._id,
                                        body: data.body,
                                        video: data.video,
                                    }
                                }
                        },
                        (err, user) => {
                            if (err) res.send({msg: "Something went wrong", success: false});
                            if (user) res.send({msg: "Data Saved", post: data, success: true});
                        }
                    );
                }
            ]);
        },{resource_type: "video"});
    }
else
	{
        async.waterfall([
            function (callback) {
                var newPost = new Post();
                newPost.body = body.trim();
                newPost.owner = userdata;
                newPost.save((err, data) => {
                    if (err) res.send({msg: "Something went wrong", success: false});
                    if (data) callback(null, data);
                });
            },
            function (data, callback) {
                User.findOneAndUpdate(
                    {_id: req.user._id},
                    {
                        $push:
                            {
                                posts: {
                                    post: data._id,
                                    body: data.body,
                                }
                            }
                    },
                    (err, user) => {
                        if (err) res.send({msg: "Something went wrong", success: false});
                        if (user) res.send({msg: "Data Saved", post: data, success: true});
                    }
                );
            }
        ]);
	}

});


// Like Toggle

router.post('/toggleLike',function(req,res,next){
    var postID = req.body.id;
    db.findData(Post,{_id:postID})
        .then(function(data){
            var index = data.likes.indexOf(req.user._id);
            if(index == -1){
                //find post owner and update likes
                db.findData(User,{_id:data.owner.userID})
                    .then(function(user){
                        if(req.user._id != data.owner.userID){
                            var newNotific = new Notification();
                            newNotific.showTo = data.owner.userID;
                            newNotific.taskBy = req.user._id;
                            newNotific.taskByImg = req.user.image;
                            newNotific.taskType = "like", newNotific.taskID = postID;
                            //newNotific.taskImg = req.owner.image;
                            newNotific.taskByName = req.user.fullname;
                            newNotific.save();
                        }
                        user.likes = user.likes + 1;
                        user.save((err,user) => {
                            if(err) res.send({success:false});
                            if(user){
                                //update posts data
                                data.likes = data.likes.concat([req.user._id]);
                                data.save((err,data) => {
                                    if(err) res.send({success:false});
                                    if(data) res.send({like:true,success:true});
                                });
                            }
                        });
                    })
                    .catch(function(err){
                        next(err);
                    });
            }else{

                //find post owner and update likes
                db.findData(User,{_id:data.owner.userID})
                    .then(function(user){
                        user.likes = user.likes - 1;
                        user.save((err,user) => {
                            if(err) res.send({success:false});
                            if(user){
                                //update posts data
                                data.likes = data.likes.find(like => like != req.user._id);
                                data.save((err,data) => {
                                    if(err) res.send({success:false})
                                    if(data) res.send({like:false,success:true});
                                });
                            }
                        });
                    })
                    .catch(function(err){
                        next(err);
                    });
            }

        })
        .catch(function(err){
            next(err);
        });

});

router.post('/saveComment',function(req,res,next){

	if(!req.body.text) {
		return res.send({msg:"Please enter a comment",success:false});
	}

	db.findData(Post,{_id:req.body.id})
	  .then(function(data){
	  	 data.comments = data.comments.concat({user:req.user._id,fullname:req.user.fullname,username:req.user.username,comment:req.body.text});
	  	 data.save((err,info) => {
	  	 	if(err) res.send({success:false});

	  	 	//add comment notification to model

		  	if(req.user._id != data.owner.userID){
		  		var newNotific = new Notification();
		  			newNotific.showTo = data.owner.userID;
		  			newNotific.taskBy = req.user._id;
		  			newNotific.taskByImg = req.user.image;
		  			newNotific.taskType = "comment",
		  			newNotific.taskID = req.body.id;
		  			newNotific.taskImg = data.owner.image;
		  			newNotific.taskByName = req.user.fullname;
		  			newNotific.save();
		  	}
		  	res.send({success:true,fullname:req.user.fullname,_id:req.user._id});
	  	 });
	  })
	  .catch(function(err){
	  	next(err);
	  })

});

module.exports = router;