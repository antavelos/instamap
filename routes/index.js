
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
	        console.log('Error: ' + result.message);
	       this.retry(5000); // try again after 5 sec
	    } else {
	        res.render('user/userProfile', { result: JSON.stringify(result.data), user: req.user });
	    }
	});	  
};

exports.mediaRecent = function(req, res){
    rest.get('https://api.instagram.com/v1/users/' + req.user.id + '/media/recent?count=30&access_token=' + req.user.accessToken).on('complete', function(result) {
	    if (result instanceof Error) {
	        console.log('Error: ' + result.message);
	        this.retry(5000); // try again after 5 sec
	    } else {
	    	data = JSON.stringify(result.data);
	    	objData = JSON.parse(data);
	    	images = new Array();	    	
	    	for (var i = 0; i < objData.length; i++){
	    		images.push(objData[i].images.low_resolution.url);
	    	}
	        res.render('user/mediaRecent', { images: images, user: req.user });
	    }
	});	  
};

exports.selfFeed = function(req, res){
    rest.get('https://api.instagram.com/v1/users/self/feed?count=100&access_token=' + req.user.accessToken).on('complete', function(result) {
	    if (result instanceof Error) {
	        console.log('Error: ' + result.message);
	        this.retry(5000); // try again after 5 sec
	    } else {
	    	data = JSON.stringify(result.data);
	    	objData = JSON.parse(data);
	    	images = new Array();
	    	for (var i = 0; i < objData.length; i++){
	    		images.push(objData[i].images.low_resolution.url);
	    	}
	        res.render('user/selfFeed', { images: images, user: req.user });
	    }
	});
};

exports.mediaLiked = function(req, res){
    rest.get('https://api.instagram.com/v1/users/self/media/liked?count=100&access_token=' + req.user.accessToken).on('complete', function(result) {
	    if (result instanceof Error) {
	        console.log('Error: ' + result.message);
	        this.retry(5000); // try again after 5 sec
	    } else {
	    	data = JSON.stringify(result.data);
	    	objData = JSON.parse(data);
	    	images = new Array();
	    	for (var i = 0; i < objData.length; i++){
	    		images.push(objData[i].images.low_resolution.url);
	    	}
	        res.render('user/mediaLiked', { images: images, user: req.user });
	    }
	});
};

exports.mediaLikedMe = function(req, res){
    rest.get('https://api.instagram.com/v1/users/' + req.user.id + '/media/recent?count=100&access_token=' + req.user.accessToken).on('complete', function(result) {
	    if (result instanceof Error) {
	        console.log('Error: ' + result.message);
	        this.retry(5000); // try again after 5 sec
	    } else {
	    	data = JSON.stringify(result.data);
	    	objData = JSON.parse(data);
	    	images = new Array();	    	
	    	for (var i = 0; i < objData.length; i++){
	    		if (objData[i].likes.count != 0) {
	    			likes = new Array();
	    			for (var j in objData[i].likes.data) {
	    				likes.push(objData[i].likes.data[j].profile_picture);
	    			}
	    			images[objData[i].images.low_resolution.url] = likes;
	    		}
	    	}
	        res.render('user/mediaLikedMe', { images: images, user: req.user });
	    }
	});
};