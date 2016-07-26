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
var connect = require('connect');
var serveStatic = require('serve-static');
var fs = require('fs');
var cheerio = require('cheerio');
var randtoken = require('rand-token');


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
var EmailData = require('./app/models/emailData');


connect().use(serveStatic(__dirname)).listen(8000, function(){
    console.log('HTML server running on 8080...');
});


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Connection Request made');
    next(); // make sure we go to the next routes and don't stop here
});

function saveEmailData(htmlData){
  var emailData = new EmailData();      // create a new instance of the Bear model
        emailData.htmlData = htmlData.html();  // set the bears name (comes from the request)
        var token = randtoken.generate(16);
        emailData.token = token;
        // save the bear and check for errors
        emailData.save(function(err) {
            if (err)
                console.log(err);
            console.log('EmailData saved!');
        });
        return token;
}

function getHTML(id, message){

  var finalHTML = cheerio.load(fs.readFileSync('./app/html_templates/base_template_o.html'));
  finalHTML('#ytplayer')['0'].attribs['src'] = 'https://www.youtube.com/embed/' + id + '?modestbranding=1&autoplay=1&iv_load_policy=3&rel=0&showinfo=0';
  finalHTML('#messageIn').text(message);

  var token = saveEmailData(finalHTML);





  var $ = cheerio.load(fs.readFileSync('./app/html_templates/base_template.html'));
  $('#videoId')['0'].attribs['src'] = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
  $('#messageIn').text(message);
  $('#finalHTMLLink')['0'].attribs['href'] = 'http://10.0.1.8:8080/api/loadEmail/' + token;

  //a href = link+token
  var htmlData = $.html();
  return htmlData;
}

function sendEmail(id, userMail, email, subject, message){
  // listen for token updates (if refreshToken is set)
// you probably want to store these to a db
// generator.on('token', function(token){
//     console.log('New token for %s: %s', token.user, token.accessToken);
// });

// var html_code = "<html><head><meta name='viewport' content='width=device-width'><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'><title>Really Simple HTML Email Template</title><style>{font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; font-size: 100%; line-height: 1.6em; margin: 0; padding: 0;}img{max-width: 600px; width: auto;}body{-webkit-font-smoothing: antialiased; height: 100%; -webkit-text-size-adjust: none; width: 100% !important;}a{color: #348eda;}.btn-primary{Margin-bottom: 10px; width: auto !important;}.btn-primary td{background-color: #348eda; border-radius: 25px; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; text-align: center; vertical-align: top;}.btn-primary td a{background-color: #348eda; border: solid 1px #348eda; border-radius: 25px; border-width: 10px 20px; display: inline-block; color: #ffffff; cursor: pointer; font-weight: bold; line-height: 2; text-decoration: none;}.last{margin-bottom: 0;}.first{margin-top: 0;}.padding{padding: 10px 0;}/* ------------------------------------- BODY------------------------------------- */table.body-wrap{padding: 20px; width: 100%;}table.body-wrap .container{border: 1px solid #f0f0f0;}/* ------------------------------------- FOOTER------------------------------------- */table.footer-wrap{clear: both !important; width: 100%;}.footer-wrap .container p{color: #666666; font-size: 12px;}table.footer-wrap a{color: #999999;}/* ------------------------------------- TYPOGRAPHY------------------------------------- */h1,h2,h3{color: #111111; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-weight: 200; line-height: 1.2em; margin: 40px 0 10px;}h1{font-size: 36px;}h2{font-size: 28px;}h3{font-size: 22px;}p,ul,ol{font-size: 14px; font-weight: normal; margin-bottom: 10px;}ul li,ol li{margin-left: 5px; list-style-position: inside;}/* --------------------------------------------------- RESPONSIVENESS------------------------------------------------------ *//* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */.container{clear: both !important; display: block !important; Margin: 0 auto !important; max-width: 600px !important;}/* Set the padding on the td rather than the div for Outlook compatibility */.body-wrap .container{padding: 20px;}/* This should also be a block element, so that it will fill 100% of the .container */.content{display: block; margin: 0 auto; max-width: 600px;}/* Let's make sure tables in the content area are 100% wide */.content table{width: 100%;}</style></head><body bgcolor='#f6f6f6'><table class='body-wrap' bgcolor='#f6f6f6'> <tr> <td></td><td class='container' bgcolor='#FFFFFF'> <div class='content'> <table> <tr> <td> <p>Hi there,</p><p>Sometimes all you want is to send a simple HTML email with a basic design.</p><h1>Really simple HTML email template</h1> <p>This is a really simple email template. Its sole purpose is to get you to click the button below.</p><h2>How do I use it?</h2> <p>All the information you need is on GitHub.</p><table class='btn-primary' cellpadding='0' cellspacing='0' border='0'> <tr> <td> <a href='http://localhost:8000/app/html_templates/email.html'>View the source and instructions on GitHub</a> </td></tr></table> <p>Feel free to use, copy, modify this email template as you wish.</p><p>Thanks, have a lovely day.</p><p><a href='http://twitter.com/leemunroe'>Follow @leemunroe on Twitter</a></p></td></tr></table> </div></td><td></td></tr></table><table class='footer-wrap'> <tr> <td></td><td class='container'> <div class='content'> <table> <tr> <td align='center'> <p>Don't like these annoying emails? <a href='#'><unsubscribe>Unsubscribe</unsubscribe></a>. </p></td></tr></table> </div></td><td></td></tr></table></body></html>"
var html_code = getHTML(id, message);
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
    html: html_code , // plaintext body
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

  router.route('/ch')

    .post(function(req, res){
      console.log(req.body);
        var id = req.body.videoId;
        var $ = cheerio.load(fs.readFileSync('./app/html_templates/base_template.html'));
        // $('#messageIn').text('dsfds2');
        // console.log($('#messageIn').text());

        // console.log($.html());
        res.json({ message: 'Done' });
    });

    router.route('/loadEmail/:token')
      // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
      .get(function(req, res) {
          EmailData.findOne({'token':req.params.token}, 'htmlData', function(err, emailData) {
              if (err)
                  res.send(err);
              res.send(emailData.htmlData);
          });
      });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
