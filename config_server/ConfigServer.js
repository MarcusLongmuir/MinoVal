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

    us.express_server.post('/get_types', function(req, res) {
        var types = {
            "name" : "types",
            "display_name" : "Types",
            "type" : "object",
            "fields" : []
        };
        
        minoval.minodb.api.call({username:minoval.user},{
            "function": "search",
            parameters: {
                paths: [
                    "/Mino/types/"  
                ]
            }
        },function(err,types_res){
            for (var i=0; i<types_res.objects.length; i++) {
                var type = types_res.objects[i].mino_type
                types.fields.push(type);
            }
            logger.log('received types', JSON.stringify(types, null, 4))

            var json_response = {
                types: types
            }

            if (req.body.name !== undefined) {
                minoval.get_rule(req.body.name, function(err, rule) {
                    json_response.rule = rule;
                    res.json(json_response);
                })   
            } else {
                res.json(json_response);
            }
        });
    });

}

module.exports = ConfigServer;