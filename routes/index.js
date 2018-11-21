var express = require('express');
var router = express.Router();
var middleware = require('../middlewares/middleware');
var nodemailer = require('nodemailer');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var async  = require('async');
var voucher_codes = require('voucher-code-generator');

var User   = require('../models/user');
var Referral   = require('../models/referral');
var Notification = require('../models/notification');
var get    = require('../secure/smtp-cred');
var methods = require('../secure/methods');
var db = require('../secure/db');

/* GET login */
router.get('/',middleware.notAllowed, function(req, res, next) {
  res.render('index',{title:"Steel Smiling| Login",header:false,navbar:false});
});

/* GET signup */

router.get('/validate',middleware.notAllowed,function(req,res,next){
	res.render('validatereferral',{title:"Steel Smiling | Sign Up",header:false,navbar:false});
});

 router.get('/signup',middleware.notAllowed,function(req,res,next){
     res.render('signup',{title:"Steel Smiling  | Sign Up",header:false,navbar:false});
});

router.get('/registerMHP',function(req,res,next){
    res.render('registerMHP',{title:"Steel Smiling | Sign Up",header:true,navbar:true,user:req.user});
});

/* GET Logout */

router.get('/logout',function(req,res,next){
  req.session.destroy();
  req.logout();
  res.redirect('/');
});

/* GET all notifications */
router.get('/getFeed',function(req,res,next){
   //console.log("In getFeed")
    Notification.find({showTo:req.user._id},(err,data)=>{
      res.send(data);
    }).sort({'_id':-1});

});


/* Post Login - Local */

router.post('/login',middleware.login_valid,passport.authenticate('local.login',{
        successRedirect : '/home',
        failureRedirect : '/',
        failureFlash    : true
    }));


/* POST Register User */

router.post('/register',middleware.reg_valid,function(req,res,next){
    var hash = methods.token(req.body.email);

    var userData = {
    		fullname  	 : req.body.fullname,
    		username  	 : req.body.username,
    		email 	  	 : req.body.email,
    		password  	 : bcrypt.hashSync(req.body.password, 10),
            role : "Peer",
            status :"1",
    		accountToken : hash
    };

    console.log("email" +userData.email);
    var newUser = new User(userData);
    newUser.save((err) => {
        var data = {msg:"Account created successfully.Please login.",success:true};
        res.send(data);
    });
    /**
    *  Sending activation tokento user for account activation. - START
    **/

     /*var mailOptions = {
            from     : 'Steel Smiling',
            to       :  userData.email,
            subject  : 'Account Acivation',
            html     : `<h1>Account Activation</h1>
                        <p>Hello <b>${userData.fullname}</b>.<br>Your account has been successfully created and to make
                        a use of it you have to activate your account by clicking <a href="https://testingmode.herokuapp.com/activate/${userData.username}/${userData.accountToken}">here</a>.</p>
                        `
        };*/

        /*methods.sendMail(mailOptions).then(function(info){
            var newUser = new User(userData);
            console.log("newUser"+newUser);
            newUser.save((err) => {
                var data = {msg:"Account created successfully.Check your email for activation.",success:true};
                res.send(data);
            });
        }).catch(function(err){
             var data = {msg:"Something 989 went wrong.",param:"",success:false};
             res.send(data);
        });*/

    /**
    *  Sending activation tokento user for account activation. - END
    **/


});

router.post('/signupmhp',middleware.reg_valid,function(req,res,next){
    var hash = methods.token(req.body.email);
    console.log(req.body.password);
    var userData = {
        fullname  	 : req.body.fullname,
        username  	 : req.body.username,
        email 	  	 : req.body.email,
        password  	 : bcrypt.hashSync(req.body.password, 10),
        role : "Practitioner",
        status :"1",
        accountToken : hash
    };

    var newUser = new User(userData);
    newUser.save((err) => {
        var mailOptions = {
            from     : 'sansundar561@gmail.com',
            to       :  userData.email,
            subject  : 'Steel Smiling - Account Activation',
            html     : `<h1>Steel Smiling - Account Activation</h1>
                       <p>Hello <b>${userData.fullname}</b>,<br>You have been added as a practitoner in Steel Smiling. Your email id is: <b>${userData.email}</b> and temporary password is: <b>${req.body.password}</b>. Sign on <a href="http://localhost:3000/"> now! Don't forget to reset the password</p><br> `
        };
        methods.sendEmail(mailOptions).then(function(info){
            data = {msg: "Email sent to the Practitioner", success: true};
            res.send(data);

        }).catch(function(err){
            data = {msg: "Check if its a valid email id", success: false};
            res.send(data);
        });
    });
});

router.post('/referral',function(req,res,next){
    var email = req.body.email;
    var referralCode = voucher_codes.generate({
                        length: 8,
                        count: 1
                        });
    var referralData = {
        referralCodegen  	 : referralCode,
        referralCodeval     : "",
    };
    var mailOptions = {
           from     : 'sansundar561@gmail.com',
           to       :  email,
           subject  : 'Steel Smiling - Account Activation',
           html     : `<h1>Steel Smiling - Account Activation</h1>
                       <p>Hello <b>Community Member,</b>.<br>Your friend has referred 
                       you to join Steel Smiling Community. Sign on <a href="http://localhost:3000/"> now and please use this referral code to join <b>${referralCode}</b></p>  `
       };
    methods.sendEmail(mailOptions).then(function(info){
        var newReferral = new Referral(referralData);
        newReferral.save((err) => {
            var data = {msg:"Account created successfully.Check your email for activation.",success:true};
            res.send(data);
        });
    }).catch(function(err){
        console.log("In error");
         var data = {msg:"Something went wrong.",param:"",success:false};
         res.send(data);
    });

});

router.post('/validatereferral',function(req,res,next){
    var referralCode = req.body.referralcode;
    if(referralCode == ""){
        data = {msg:"Referral Code is required.",param:"",success:false};
    }else {
        var validation = req.checkBody('referralcode', 'Referral code already exist. Please enter a unique code').isExist_referralcodegen();
        req.getValidationResult()
            .then(function(result) {

                var error = result.array();
                var data;
                if (error.length == 0) {
                    var validation = req.checkBody('referralcode', 'Referral code already exist. Please enter a unique code').isExist_referralcodeval();
                    req.getValidationResult().then(function(result) {

                        var error = result.array();
                        var data;

                        if (error.length == 0) {
                            data = {msg: "This referral code has been already used.", success: false};
                            res.send(data);

                        } else {
                            Referral.findOneAndUpdate(
                                {referralCodegen: referralCode},
                                {
                                    $set:
                                        {
                                            referralCodeval:referralCode,
                                        }
                                },
                                (err, referralcode) => {
                                    if (err) {
                                        res.send({msg: "Something went wrong", success: false});
                                    }
                                    if (referralcode) {
                                        data = {msg: "Successfully validated referral code", success: true};
                                        res.send(data);
                                    }
                                }
                            );
                        }
                    })
                } else {
                    data = {msg: "This is an invalid referral code.", success: false};
                    res.send(data);
                }
            });

    }
});


/*POST Reset Password*/

router.post('/reset/:user/:token',function(req,res,next){
    
    req.checkBody('newPassword','All fields are mandatory.').notEmpty();
    req.checkBody('confirmPassword','All fields are mandatory.').notEmpty();
    req.checkBody('newPassword','Password must be greater than 7 characters.').len(8);
    req.assert('confirmPassword','Password not matched').equals(req.body.newPassword); 

    req.getValidationResult().then(function(result) {
       var error = result.array();
       if(error.length > 0){
         req.flash('error',error[0].msg);
         res.redirect('/reset/'+req.params.user+'/'+req.params.token);
       }else{
             User.findOneAndUpdate(
                {$and : [{email:req.params.user},{resetToken:req.params.token}]},
                {$set:{expireToken: Date.now(),resetToken: "",password:bcrypt.hashSync(req.body.newPassword, 10)}},
                (err,user) => {
                    if(err) throw err;
                    if(!user) req.flash('error','Something went wrong.');
                    if(user) req.flash('success','Password reset successfully.');
                    res.redirect('/');
            });
       }
    });

});






module.exports = router;
