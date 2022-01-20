var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({

    companyName: String,
    email: String,
    fname: String,
    lname: String,
    phone: String,
    activated: {type: Boolean, default: true},
  
    cac: String,
    businessType: String,
    compliance: {type: Boolean, default :false},

    activated: {type: Boolean, default:false},
    activationCode: String,
    
    password: String,
   
    created: {type: Date, default:Date.now}
  
});


var User = mongoose.model("User", UserSchema);
module.exports = User;
