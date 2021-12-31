const request = require('request');
const nodemailer = require('nodemailer');


exports.sendSuccessResponse = function (res, content, message) {
    let data = {
        success: true,
        message: message,
        data: content
    };
    res.status(200).json(data);
};
exports.sendErrorResponse = function (res, content, message, status) {
    status = !status ? 422 : status;
    let data = {
        success: false,
        message: message,
        data: content
    };
    res.status(status).json(data);
};

exports.sendEmail = (email, subject, text) => {

    var transporter = nodemailer.createTransport({
        host: 'dynamicgovernancesolutions.ng',
        port: 465,
        //service: 'gmail',
        auth: {
            user: 'awele.osuka@dynamicgovernancesolutions.ng',
            pass: process.env.PASS
        }
        });
     
        var mailOptions = {
            from: '"Awelle from Iducate" <awele.osuka@dynamicgovernancesolutions.ng>',
            to: email,
            subject: subject,
            text: text
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {

                console.log(error, "errr");
                return false;
            }
           
                console.log(info, "res");
                return true
            
        });

}


exports.generateId = (l) => {

    const length = l;
    let timestamp = Date.now().toString();

    let _getRandomInt = function( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
    };

    let parts = timestamp.split( "" ).reverse();
    let id = "";

    for( let i = 0; i < length; ++i ) {
        const index = _getRandomInt( 0, parts.length - 1 );
        id += parts[index];
    }

    return id;
};


exports.queueTask = (channel, data) => {

    var amqp = require('amqplib');
    let body = JSON.stringify(data);
    const open = amqp.connect(process.env.RABBITMQ);
    open.then((conn) => {
        return conn.createChannel();
    }).then((ch) => {

       
        //   ch.assertExchange(exchange, 'fanout', {}).then((ok)=>{
        //     ch.publish(exchange, '', Buffer.from(body));
        //    // console.log(" [x] Sent %s", body);
          
        //    });

    return ch.assertQueue(channel).then(function(ok) {
        ch.sendToQueue(channel, Buffer.from(body));
       // console.log(' [x] Sent %s', body);
        return ch.close();
    });

    }).catch(console.warn);
   
   
   
    //return conn.close();
    // var amqp = require('amqplib/callback_api');
    // let body = JSON.stringify(data);

    // amqp.connect(process.env.RABBITMQ, function(err, conn) {
    // conn.createChannel(function(err, ch) {
       

    //     ch.assertExchange(exchange,'fanout', {});
    //     // Note: on Node 6 Buffer.from(msg) should be used
    //     ch.publish(exchange, '', Buffer.from(body) );
    //     console.log(" [x] Sent %s", body);
    //   });
      
    //    setTimeout(function() { conn.close();  }, 9000);
    // });


};

