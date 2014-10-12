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
    us.express_server.use(express.static(path.join(__dirname, 'bower_components')));
    us.express_server.disable('etag');//Prevents 304s

    us.express_server.get('/types', function(req, res) {
        minoval.get_types_as_booleans(function(err, types) {
            var params = {
                types: JSON.stringify(types)
            }
            res.render('types.mustache', params);
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

}

module.exports = EndpointServer;