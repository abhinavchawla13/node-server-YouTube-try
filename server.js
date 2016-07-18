// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var https = require('https');
var async = require('async');


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




function videoCheck(id) {
  console.log(id);

  var currentStatus = "1";
  recursiveCall(id);
}

var recursiveCall = function (id, res) {
  if(res && res == 'processed') {
    // console(".");
    console.log(res);
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
              recursiveCall(id, parsed.items[0].status.uploadStatus);
            }, 5000)
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

    // save the bear and check for errors
    youTube.save(function(err) {
        if (err)
            res.send(err);
        videoCheck(youTube.url);
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
