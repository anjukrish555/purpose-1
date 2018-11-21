var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var googleStrategy = require('passport-google-oauth20').Strategy;
var bcrypt = require('bcryptjs');

var User = require('../models/user');
var get  = require('./smtp-cred');
var db   = require('./db');
var methods = require('../secure/methods');


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
 	done(null, user);
});

// local strategy for login

passport.use('local.login',new localStrategy({
	usernameField : "email",
	passwordField : "password",
	passReqToCallback : true
},(req,email,password,done) => {
	db.findData(User,{email:email})
	  .then(function(data){
	  	if(bcrypt.compareSync(password,data.password)){
			return done(null,data);
		} else{
		   return done(null,false,req.flash('error','Credentials not matched.'));
		}
	  }).catch(function(err){
	  	return done(null,false,req.flash('error','Something went wrong.'));
	  });
}));
