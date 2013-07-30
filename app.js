
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var config = require('./config.js');
var User = require('./models/user.js');
var passport = require('passport');
var	FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var InstagramStrategy = require('passport-instagram').Strategy;


function ensureAuthenticated(req, res, next){
	if (req.isAuthenticated())
		return next();
	
}

passport.serializeUser(function(user, done){
	done(null, user)
});

passport.deserializeUser(function(id, done){
	User.findOne(id, function(err, user){
		done(err, user);
	});
});

function checkUser(accessToken, refreshToken, profile, done, socialType)
{
	var query = User.findOne({ id: profile.id });
	query.exec(function(err, oldUser) {
		if (oldUser) {
			console.log('Existing ' + socialType + ' user: ' + oldUser.name + ' found and logged in!');
			done(null, oldUser);
		} else {
			var newUser = new User();
			newUser.id = profile.id;
			newUser.name = profile.displayName;
			if (profile.emails){
				newUser.email = profile.emails[0].value;	
			}			
			newUser.social = socialType;
			newUser.accessToken = accessToken;
			newUser.refreshToken = refreshToken;

			newUser.save(function(err){
				if (err) throw err;
				console.log('New ' + socialType + ' user: ' + newUser.name + ' created and logged in!');
				done(null, newUser);
			});
		}
	});
}

passport.use(new FacebookStrategy({
	clientID: config.development.fb.appId,
	clientSecret: config.development.fb.appSecret,
	callbackURL: config.development.fb.url + 'auth/facebook/callback'
	},
	function(accessToken, refreshToken, profile, done) {
		process.nextTick(function(){
			checkUser(accessToken, refreshToken, profile, done, 'Facebook');
		});
	}
));

passport.use(new TwitterStrategy({
	consumerKey: config.development.twitter.appKey,
	consumerSecret: config.development.twitter.appSecret,
	callbackURL: config.development.twitter.url + 'auth/twitter/callback'
	},
	function(accessToken, refreshToken, profile, done) {
		process.nextTick(function(){			
			checkUser(accessToken, refreshToken, profile, done, 'Twitter');
		});
	}
));

passport.use(new InstagramStrategy({
	clientID: config.development.instagram.appKey,
	clientSecret: config.development.instagram.appSecret,
	callbackURL: config.development.instagram.url + 'auth/instagram/callback'
	},
	function(accessToken, refreshToken, profile, done) {
		process.nextTick(function(){
			checkUser(accessToken, refreshToken, profile, done, 'Instagram');
		});
	}
));

var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.session({secret: 'aaaaaaaaafsgsdfgshgsrt' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(require('less-middleware')({
	src: __dirname + '/public',
	compress: true
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/loggedin', routes.loggedin);
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'read_mailbox'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/',  successRedirect: '/loggedin'}));
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/',  successRedirect: '/loggedin'}));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/',  successRedirect: '/loggedin'}));
app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/logout', function(req, res){
	req.logOut(),
	res.redirect('/');
});
app.get('/instagram/user/profile', routes.userProfile);
app.get('/instagram/media/recent', routes.mediaRecent);
app.get('/instagram/self/feed', routes.selfFeed);
app.get('/instagram/self/media/liked', routes.mediaLiked);
app.get('/instagram/self/media/likedme', routes.mediaLikedMe);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
