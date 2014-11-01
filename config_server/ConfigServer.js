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

    us.express_server.post('/get_types', function(req, res) {
        minoval.get_types_as_booleans(function(err, types) {
            if (req.body.name !== undefined) {
                minoval.get_endpoint(req.body.name, function(err, endpoint) {
                    res.json({
                        endpoint: endpoint,
                        types: types
                    })
                })   
            } else {
                res.json({
                    types: types
                });
            }
        });
    });

    us.express_server.post('/save_endpoint', function(req, res) {
        logger.log(req.body)

        var types = req.body;
        var name = types.name;
        delete types.name;

        minoval.save_endpoint(name, types, function(error, response) {
            
            var original_url = req.originalUrl;
            var minoval_path = original_url.substring(0, original_url.length - req._parsedUrl.path.length) + '/'
            res.json({
                success:true
            });

        });
    });

    us.express_server.post('/delete_endpoint', function(req, res) {
        logger.log(req.body)
        minoval.delete_endpoint(req.body.name, function(error, response) {
            logger.log(error, response);
            if (error) {
                res.json(error)
            } else {
                res.json(response);
            }
        });
    });    

    us.express_server.post('/get_endpoints', function(req, res) {
        minoval.minodb.api.call({username:"TestUser"},{
            "function": "search",
            parameters: {
                paths: [
                    "/TestUser/endpoints/"  
                ]
            }
        },function(err, endpoints_res){
            logger.log(err, endpoints_res);
            res.json(endpoints_res);
        });
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

}

module.exports = ConfigServer;