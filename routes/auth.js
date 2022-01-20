
var express = require('express');
const User = require('../models/user');

const {sendEmail, generateToken} = require('../helpers/utility');
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

        if(!user.activated){
            return res.render('auth/login.html', { response: "Please check your email to activate your account", resType:"info", icon:"alert",  values: req.body});       
        }

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



router.get("/signup", (req, res) => {
      res.render('auth/signup.html', {} );    
});

router.post("/signup", (req, res) => {  
      
  User.findOne({ email : req.body.email}, (err, user) => {
     if(user == null){

      let code = generateToken( { email: req.body.email, phone: req.body.phone} );
        

      let nRecord                    = new User();
      nRecord.fname                = req.body.fname;
      nRecord.lname               = req.body.lname;
      nRecord.email                = req.body.email;
      nRecord.phone                 = req.body.phone; 
      nRecord.activationCode       = code;
      nRecord.password              = req.body.password;
   
     
         nRecord.save((err) => {
            if (err) {
                  console.log(err);
            }      
        });

        sendEmail(req.body.email, "Activate your Jakoda account", `Hello, <br><br> Please click the link below to activate your account <br> <br>
        http://jakodapay.com/auth/activate/${code}`)

        res.render('auth/signup.html', { response: "Please check your email to activate your account", resType:"info", icon:"alert"});       
      
       

     }else{
       console.log(user, 'll');
         res.render('auth/login.html', { response: "Email already exists, please login", resType:"danger", icon:"alert",  values: req.body});       
     }

  });
});

router.get("/activate/:code", (req, res) => {  
  User.findOne({ activationCode : req.params.code}, (err, user) => {
      if(user != null){
       User.updateOne(
              {activationCode: req.params.code},
      
              { $set: {
                  activated: true,
                  activationCode: ""
              }},
              (err, result) => {
                  if(err){
                      console.log(err)
                  }else{ 
                     res.render('auth/login.html', { response: "Your account has been activated! You can login now", resType:"danger", icon:"alert"});       
                  }
              });
      }else{
          res.render('auth/login.html', { response: "Code is invalid, please check", resType:"danger", icon:"alert"});       
      }

  });
});


router.get("/logout", (req, res) => {
 
  req.session.destroy()
     res.redirect('/auth/login');

     
});


module.exports = router;