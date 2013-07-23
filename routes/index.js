
/*
 * GET home page.
 */


var rest = require('restler');
var sys = require('sys');

exports.index = function(req, res){
  res.render('index', { title: 'Geo Social' });
};

exports.loggedin = function(req, res){

	res.render('loggedin', { 
		title: 'Geo Social', 
		user: req.user
	});
};

exports.userProfile = function(req, res){
    rest.get('https://api.instagram.com/v1/users/' + req.user.id + '?access_token=' + req.user.accessToken).on('complete', function(result) {
	    if (result instanceof Error) {
	        sys.puts('Error: ' + result.message);
	       this.retry(5000); // try again after 5 sec
	    } else {
	        res.render('instagram', { result: JSON.stringify(result.data) });
	    }
	});	  
};

exports.selfFeed = function(req, res){
    rest.get('https://api.instagram.com/v1/users/' + req.user.id + '/media/recent?count=30&access_token=' + req.user.accessToken).on('complete', function(result) {
	    if (result instanceof Error) {
	        sys.puts('Error: ' + result.message);
	        this.retry(5000); // try again after 5 sec
	    } else {
	    	data = JSON.stringify(result.data);
	    	objData = JSON.parse(data);
	    	images = new Array();
	    	console.log(objData.length);
	    	for (var i = 0; i < objData.length; i++){
	    		images.push(objData[i].images.low_resolution.url);
	    	}
	        res.render('instagram', { images: images });
	    }
	});	  
};