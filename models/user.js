var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.development.dbUrl);

var userSchema = new mongoose.Schema({
	id: String,
	name: String,
	email: { type: String, lowercase: true },
	social: String,
	accessToken: String,
	refreshToken: String
});

module.exports = mongoose.model('User', userSchema);

