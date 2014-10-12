var logger = require('tracer').console();

var express = require('express');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');

var http = require('http');
var path = require('path');

function EndpointServer(minoval){
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
            minoval_path: minoval_path
        }

        res.render('root.mustache', params);
    });

    us.express_server.post('/get_types', function(req, res) {
        minoval.get_types_as_booleans(function(err, types) {
            res.json(types);
        });
    });

    us.express_server.post('/create_endpoint', function(req, res) {
        logger.log(req.body)

        var types = req.body;
        var name = types.name;
        delete types.name;

        minoval.create_endpoint(name, types, function(error, response) {
            
            var original_url = req.originalUrl;
            var minoval_path = original_url.substring(0, original_url.length - req._parsedUrl.path.length) + '/'
            res.json({
                redirect: minoval_path + 'forms/' + name
            });

        });
    })

    us.express_server.post('/get_endpoints', function(req, res) {
        minoval.mino.api.call({username:"TestUser"},{
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

}

module.exports = EndpointServer;