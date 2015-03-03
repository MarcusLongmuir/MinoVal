var logger = require('tracer').console();

var express = require('express');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');

var http = require('http');
var path = require('path');

function ConfigServer(minoval){
	var us = this;

	us.express_server = express();

    us.express_server.disable('etag');//Prevents 304s
    us.express_server.engine('mustache', mustacheExpress());
    us.express_server.set('views', path.join(__dirname, 'views'));
    us.express_server.set('view engine', 'mustache');

    us.express_server.use(bodyParser());
    us.express_server.use(express.static(path.join(__dirname, './public')));
    us.express_server.disable('etag');//Prevents 304s

    //Serve the same html file (if a static file wasn't served)
    us.express_server.get('/*', function(req, res) {
        var original_url = req.originalUrl;
        var minoval_path = original_url.substring(0, original_url.length - req._parsedUrl.path.length) + '/'

        var params = {
            minoval_path: minoval_path,
        }

        res.render('root.mustache', params);
    });

    us.express_server.post('/save_rule', function(req, res) {
        logger.log(req.body)

        var object = req.body;
        minoval.save_rule(object, function(error, response) {
            logger.log(error, response)
            if (error) {
                res.json(error, 400);
                return;
            }

            var original_url = req.originalUrl;
            var minoval_path = original_url.substring(0, original_url.length - req._parsedUrl.path.length) + '/'
            res.json({
                success:true
            });

        });
    });

    us.express_server.post('/delete_rule', function(req, res) {
        logger.log(req.body)
        minoval.delete_rule(req.body.name, function(error, response) {
            logger.log(error, response);
            if (error) {
                res.json(error)
            } else {
                res.json(response);
            }
        });
    });    

    us.express_server.post('/get_rules', function(req, res) {
        minoval.minodb.api.call({username:minoval.user},{
            "function": "search",
            parameters: {
                paths: [
                    minoval.path
                ]
            }
        },function(err, rules){
            logger.log(err, rules);
            res.json(rules);
        });
    });

}

module.exports = ConfigServer;