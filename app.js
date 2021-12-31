require('dotenv').config()
var express = require('express');

var nunjucks = require('nunjucks');
var routes = require("./routes/index");
var bodyParser = require('body-parser');
const path = require('path');

var mongoose = require('mongoose');
var session = require('express-session');
const redis = require('redis');
var RedisStore = require('connect-redis')(session);

var app = express();

// if (process.env.SITE_DOMAIN_ROOT) {
//     //HTTPS redirection
//     app.use(function (req, res, next) {
//         if (req.header("X-Forwarded-Proto") == "https") {
//             // request was via https, so do no special handling
//             next();
//         } else {
//             // request was via http, so redirect to https
//             res.redirect('https://' + req.headers.host + req.originalUrl);
//         }
//     });
// }

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
// parse application/json
app.use(bodyParser.json());


// Setup nunjucks templating engine
var nunEnv = nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: process.env.PORT ? false : true
});
nunEnv.addGlobal('SITE_NAME', process.env.SITE_NAME || 'Jakoda');
nunEnv.addGlobal('SITE_DOMAIN_ROOT', process.env.SITE_DOMAIN_ROOT || 'Jakoda');


if(process.env.REDIS_URL){
    var client = redis.createClient( {host: process.env.REDIS_URL, port:'18149', auth_pass:'vPCsKrp5RSlnz2Ymjt9OtnNuphzP60OP'});

    app.use(session({
        store: new RedisStore({ client: client, ttl: (60*60*24*30) }),
        secret: 'haha this is hacky. change later.s bootcareers',
        resave: false,
        saveUninitialized: true,
        cookie: { path: '/', httpOnly: true, maxAge: (60*60*24*30*1000) },
    }));
} else {
    app.use(session({
        secret: 'haha this is hacky. change later.s bootcareers',
        resave: false,
        saveUninitialized: true,
        cookie: { path: '/', httpOnly: true, maxAge: (60*60*24*30*1000) },
    }));
}

// // use passport session
// app.use(passport.initialize());
// app.use(passport.session());

// // requires the model with Passport-Local Mongoose plugged in
// const User = require('./models/user');

// // USE "createStrategy" INSTEAD OF "authenticate"
// // This uses and configures passport-local behind the scenes
// passport.use(User.createStrategy());

// // use static serialize and deserialize of model for passport session support
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

connect();


app.set('port', process.env.PORT || 3000);

routes(app);
app.use(express.static('./public'));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

function listen() {
    // Kick start our server
    app.listen(app.get('port'), function () {
        console.log('Server started on port', app.get('port'));
    });
}


function connect() {
    mongoose.connection
        .on('error', console.log)
        .on('disconnected', connect)
        .once('open', listen);
    return mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true });
}
