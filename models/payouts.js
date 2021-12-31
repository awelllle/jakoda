var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PayoutSchema = new Schema({

    firstName: String,
    lastName: String,
    accountNumber: String,
    bank: String,
    amount: String,

    company: String,

    status : {type:String, default:"completed"},
    
    
    created: {type: Date, default:Date.now}
  
});


var Payout = mongoose.model("Payout", PayoutSchema);
module.exports = Payout;
