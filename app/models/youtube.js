
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var YouTubeSchema   = new Schema({
    url: String,
    email: String,
    subject: String,
    message: String,
    userMail: String
});


function videoCheck() {
  console.log(id);
}

module.exports = mongoose.model('YouTube', YouTubeSchema);
// module.exports.videoCheck = videoCheck;
