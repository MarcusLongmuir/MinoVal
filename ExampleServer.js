var logger = require('tracer').console();

var express = require('express');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');

var http = require('http');
var path = require('path');

function UIServer(minoval){
	var us = this;

	us.minoval = minoval;
	us.express_server = express();

    us.express_server.disable('etag');//Prevents 304s
    us.express_server.engine('mustache', mustacheExpress());
    us.express_server.set('views', path.join(__dirname, 'views'));
    us.express_server.set('view engine', 'mustache');

    us.express_server.use(bodyParser());
    us.express_server.use(express.static(path.join(__dirname, 'bower_components')));
    us.express_server.disable('etag');//Prevents 304s


    us.express_server.get('/forms/:name', function(req, res) {	
		minoval.get_endpoint_rule(req.params.name, function(rule) {
			logger.log(req.params.name, JSON.stringify(rule, null, 4))
			
			var original_url = req.originalUrl;
	        var mino_path = original_url.substring(0, original_url.length - req._parsedUrl.path.length)
	        var ui_path = mino_path+"/";

	        logger.log(ui_path);
			var params = {
				rule: JSON.stringify(rule),
				ui_path: ui_path
			}

			logger.log(JSON.stringify(rule));
			logger.log(params);
			res.render('form.mustache', params);
		});
    });

	us.express_server.post('/endpoint/:name', function(req, res) {
		logger.log(req.params);
		minoval.validate(req.params.name, req.body, function(validator) {
			var error = validator.end();
			logger.log(error);
			res.json(error);
		});
	});
}

module.exports = UIServer;