
var express = require('express');
const User = require('../models/user');

const {generateId} = require('../helpers/utility');
var router = express.Router();

router.get("/login", (req, res) => {
 
    sess = req.session;
    User.findOne({email : sess.email}, (err, user) => {
      if (user == null) {
        res.render('auth/login.html', {} );    
      } else {
        res.redirect('/home');
      }
  });  
});

router.post("/login", (req, res) => {  
      
    User.findOne({ email : req.body.email, password: req.body.password}, (err, user) => {
       if(user != null){

        // if(!user.activated){
        //     return res.render('login.html', { response: "Please check your email to activate your account", resType:"info", icon:"alert",  values: req.body});       
        // }

           sess = req.session;
           sess.email = req.body.email;
           sess.cname = user.companyName;
           sess.name = user.fname;
           sess.phone = user.phone;
           
           
           res.redirect("/home"); 

       }else{
           res.render('auth/login.html', { response: "Incorrect Email or Password", resType:"danger", icon:"alert",  values: req.body});       
       }

    });
});


module.exports = router;