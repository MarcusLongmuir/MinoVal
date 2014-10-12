var logger = require('tracer').console();

var express = require('express');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');

var http = require('http');
var path = require('path');

function ExampleServer(minoval){
	var us = this;

	us.minoval = minoval;
	us.express_server = express();

    us.express_server.disable('etag');//Prevents 304s
    us.express_server.engine('mustache', mustacheExpress());
    us.express_server.set('views', path.join(__dirname, 'views'));
    us.express_server.set('view engine', 'mustache');

    us.express_server.use(bodyParser());
    us.express_server.use(express.static(path.join(__dirname, 'public')));
    us.express_server.disable('etag');//Prevents 304s

    //Serve the same html file (if a static file wasn't served)
    us.express_server.get('/*', function(req, res) {

        var original_url = req.originalUrl;
        var minoval_path = original_url.substring(0, original_url.length - req._parsedUrl.path.length) + '/'
        logger.log(original_url, minoval_path);

        var params = {
            minoval_path: minoval_path
        }

        res.render('root.mustache', params);
    });


    us.express_server.post('/get_endpoint', function(req, res) {
    	logger.log(req.body.name);
		minoval.get_endpoint_rule(req.body.name, function(rule) {
			var original_url = req.originalUrl;
	        var minoval_path = original_url.substring(0, original_url.length - req._parsedUrl.path.length) + '/'

			var params = {
				rule: JSON.stringify(rule),
				minoval_path: minoval_path
			}

			logger.log(JSON.stringify(rule));
			logger.log(params);
			res.json(rule);
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

module.exports = ExampleServer;