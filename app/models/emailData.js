
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EmailDataSchema   = new Schema({
    htmlData: String,
    token: String
});


module.exports = mongoose.model('EmailData', EmailDataSchema);
// module.exports.videoCheck = videoCheck;
