// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var https = require('https');
var async = require('async');
var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');
var smtp = require('nodemailer-smtp-transport');


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

//database
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/youtube-tester'); // connect to our databa

var Bear = require('./app/models/bear');
var YouTube = require('./app/models/youtube');

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Connection Request made');
    next(); // make sure we go to the next routes and don't stop here
});

function sendEmail(id, userMail, email, subject, message){
  // listen for token updates (if refreshToken is set)
// you probably want to store these to a db
// generator.on('token', function(token){
//     console.log('New token for %s: %s', token.user, token.accessToken);
// });

// login
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        xoauth2: xoauth2.createXOAuth2Generator({
            user: 'abhinavchawla13@gmail.com',
            clientId: '556216215455-8dkbm4tckbk61mevgc3u9ij3me51509n.apps.googleusercontent.com',
            clientSecret: 'Vs-wrik5_L0ttsG7hbKxLkP5',
            refreshToken: '1/qpdOm2lgfzTvPqLPJhIKeyvAzZ-xrrJS6T4G2FyGipU',
            // accessToken: 'ya29.Ci8nAx6x-0ek3jjOwRbToVJAoZmf54z_ekzgMXBc1_B6yHhM291mzoD_bNmKnQXdCw'
        })
    }
});
// setup e-mail data with unicode symbols
var mailOptions = {
    from: {
      name: userMail,
      address: userMail
    }, // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: message + '\nYour video link: https://www.youtube.com/watch?v=' + id , // plaintext body
    // html: message'<b></b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});


}


function videoCheck(id, userMail, email, subject, message) {
  console.log(id);

  var currentStatus = "1";
  recursiveCall(id, "", userMail, email, subject, message);
}

var recursiveCall = function (id, res, userMail, email, subject, message) {
  if(res && res == 'processed') {
    console.log(".");
    console.log(res);

    sendEmail(id, userMail, email, subject, message);
    return res;
  }
  process.stdout.write(".");
  return https.get(
    'https://www.googleapis.com/youtube/v3/videos?part=status&id=' + id + '&key=AIzaSyA_wS4nqtaxPT5XvX3_IV6n9uot24YPNJ8',
    function(response) {
      var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {

            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            // console.log(parsed);
            setTimeout(function(){
              recursiveCall(id, parsed.items[0].status.uploadStatus, userMail, email, subject, message);
            }, 2000)
            // setTimeout(recursiveCall(id, parsed.items[0].status.uploadStatus), 1000);
            // return recursiveCall(id, parsed.items[0].status.uploadStatus);
        });
    }
  ).on('error', (e) => {
    console.error(e);
  });
};

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/youtube-tester')

  .get(function(req, res) {
    console.log("Getting links");
         YouTube.find(function(err, links) {
             if (err)
                 res.send(err);
             res.json(links);
         });
     })

  .post(function(req, res){
    var youTube = new YouTube();      // create a new instance of the Bear model
    youTube.url = req.body.url;  // set the bears name (comes from the request)
    youTube.subject = req.body.subject;
    youTube.email = req.body.email;
    youTube.message = req.body.message;
    youTube.userMail = req.body.userMail;
    console.log("    ");
    console.log("    ");
    console.log("*********");
    console.log("*********");
    console.log("    ");
    console.log("User Email: ", youTube.userMail);
    console.log("Email ID: ", youTube.email);
    console.log("Subject: ", youTube.subject);
    console.log("Message: ", youTube.message);
    console.log("    ");
    console.log("*********");
    console.log("*********");
    console.log("    ");


    // save the bear and check for errors
    youTube.save(function(err) {
        if (err)
            res.send(err);
        videoCheck(youTube.url, youTube.userMail, youTube.email, youTube.subject, youTube.message);
        res.json({ message: 'YouTube link created!' });
    });

  });


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
