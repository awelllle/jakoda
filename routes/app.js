var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Payouts = require('../models/payouts');
var request = require('request');
const {generateId, sendSuccessResponse, queueTask, sendErrorResponse} = require('../helpers/utility');

var Parse = require('csv-parse');
var fs = require('fs');

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary');

cloudinary.config({
cloud_name: process.env.CLOUD_NAME,
api_key: process.env.API_KEY,
api_secret: process.env.API_SECRET
});


const storage = new CloudinaryStorage({
cloudinary: cloudinary,
folder: 'jakoda',
allowedFormats: ['jpg', 'png', 'png', 'pdf'],

filename: function (req, file, cb) {
    cb(undefined);
  },
});

const parser = multer({ storage: storage });

router.use((req, res, next) => {
    res.render('auth/login.html', {} );   
});

router.post("/compliance",  parser.single('cac'), (req, res) => {
   console.log(req.file, req.body);
        
   User.updateOne({email: req.session.email}, {
      $set: {
         businessType: req.body.type,  
         cac: req.file.path,  
         compliance: true         
      },
  },(err, updated) => {
      if (err) {
          console.log(err);  
      }
      res.render('compliance.html', { response: "Your business has been verified!", resType:"danger", icon:"alert",  values: req.body});       
  
  }); 
});



router.get("/home", (req, res) => {
    res.render('home.html', {} );  
 });


 router.get("/settings", (req, res) => {
    res.render('settings.html', {} );  
 });


router.get("/transactionHistory", (req, res) => {
    res.render('transaction-history.html', {} );  
 });

 router.get("/compliance", (req, res) => {
    res.render('compliance.html', {} );  
 });


 router.get("/manage-payouts", (req, res) => {
   Payouts.find({ }, (err, items) => {
      res.render('manage-payouts.html', {items: items});
   });
});


router.get("/newPayoutFile", (req, res) => {
      res.render('new-payout-file.html', {});
});

router.post("/newPayoutFile", (req, res) => {
   var filePath =  fs.createReadStream(req.file.path);
   // filePath ? '' : res.render('App/manage-payouts');
    //console.log(filePath);

    function onNewRecord(record){
          
    let nRecord                    = new Payouts();
    nRecord.firstName               = record.firstName;
    nRecord.lastName                = record.lastName;
    nRecord.accountNumber           = record.accountNumber;
    nRecord.amount                  = record.amount;
    nRecord.bank                    = record.bank;
    nRecord.company                 = "GTB"

   
    nRecord.save((err) => {
          if (err) {
                console.log(err);
          }      
          });
        console.log(record, "jj")
    }

    function onError(error){
        console.log(error)
    }

    function done(linesRead){
       // res.send(200, linesRead)
    req.flash('message', 'Your records have been added');
    return res.redirect('/newPayoutFile');
    }

    var columns = true; 
    parseCSVFile(filePath, columns, onNewRecord, onError, done);

    
    function parseCSVFile(sourceFilePath, columns, onNewRecord, handleError, done){
          var source = fs.createReadStream(req.file.path);
    
          var linesRead = 0;
    
          var parser = Parse({
          delimiter: ',', 
          columns:columns
          });
    
          parser.on("readable", function(){
          var record;
          while (record = parser.read()) {
                linesRead++;
                onNewRecord(record);
          }
          });
    
          parser.on("error", function(error){
           handleError(error)
          });
    
          parser.on("end", function(){
           done(linesRead);
          });
    
          source.pipe(parser);
    }
    
   
});


 router.get("/newRecord", (req, res) => {
   sess = req.session;
   var options = {
   'method': 'GET',
   'url': `https://api.flutterwave.com/v3/banks/NG`,

   'headers': {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer FLWSECK-0b319575dbb24680ba53f759cab2615e-X'
   },
   json: true
   };

   request(options, function (error, response) {
   if (error){
       console.log(error)
   }   
         
  // res.render('App/new-record', { 'message': req.flash('message'), banks:response.body.data, 'error': req.flash('error') } );
   res.render('new-record.html', {banks:response.body.data} ); 
 
  });
  
});


router.post("/newRecord", (req, res) => {
             sess = req.session;
            let nRecord                    = new Payouts();
            nRecord.firstName              = req.body.fname;
            nRecord.lastName               = req.body.lname;
            nRecord.accountNumber          = req.body.number;
            nRecord.amount                 = req.body.amount; 
            nRecord.bank                   = req.body.bank;
           // nRecord.bankCode               = req.body.bankCode
            nRecord.company                = "GTB"

           
            nRecord.save((err) => {
                  if (err) {
                        console.log(err);
                  }      
                  });
             
             
            res.render('new-record.html', {response: "Record has been saved!",});
             
});



  


 

  
module.exports = router;