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
    us.express_server.use(express.static(path.join(__dirname, 'public')));
    us.express_server.disable('etag');//Prevents 304s

    us.express_server.get('/types', function(req, res) {
        var types = {
            "name" : "types",
            "display_name" : "types",
            "type" : "object",
            "fields" : []
        };
        
        minoval.mino.api.call({username:"TestUser"},{
            "function": "search",
            parameters: {
                paths: [
                    "/Mino/types/"  
                ]
            }
        },function(err,types_res){

            var boolean_levels = function(object, result) {
                logger.log(object, result);
                if (object.fields === undefined) {
                    return;
                }

                for (var i=0; i<object.fields.length; i++) {
                    var field = object.fields[i];
                    if (field.type == 'object') {
                        var new_result = {
                            name: field.name,
                            display_name: field.display_name,
                            type: "object",
                            fields: []
                        }
                        logger.log('new result', field, new_result);
                        result.fields.push(new_result);
                        boolean_levels(field, new_result)
                    } else {
                        logger.log('new field', field)
                        result.fields.push({
                            name: field.name,
                            display_name: field.display_name,
                            type: "boolean"
                        })
                    }
                }
            }

            for (var i=0; i<types_res.objects.length; i++) {
                var type = types_res.objects[i].mino_type
                types.fields.push(type);
            }
            logger.log('received types', JSON.stringify(types, null, 4))

            var boolean_types = {
                "name" : "types",
                "display_name" : "types",
                "type" : "object",
                "fields" : []
            }

            boolean_levels(types, boolean_types);
            boolean_types.fields.push({
                name: "name",
                display_name: "Name",
                type: "text"
            })

            var params = {
                types: JSON.stringify(boolean_types)
            }

            res.render('types.mustache', params);
        });
    });

    us.express_server.post('/create_endpoint', function(req, res) {
        logger.log(req.body)

        var types = req.body;
        var name = types.name;
        delete types.name;

        var exclude_unused_params = function(object) {
            for (var key in object) {
                if (object[key] === false) {
                    delete object[key]
                } else if (typeof(object[key]) === 'object') {
                    exclude_unused_params(object[key])
                }
            }

            for (var key in object) {
                if (typeof(object[key]) === 'object' && Object.getOwnPropertyNames(object[key]).length == 0) {
                    delete object[key]
                }
            }
        }

        exclude_unused_params(types);

        minoval.mino.api.call({username:"TestUser"},{
            "function": "save",
            parameters: {
                objects: [
                    {
                        name: name,
                        path: "/TestUser/endpoints/",
                        mino_type: types
                    }
                ]
            }
        },function(err,response){
            var original_url = req.originalUrl;
            var minoval_path = original_url.substring(0, original_url.length - req._parsedUrl.path.length) + '/'
            res.json({
                redirect: minoval_path + 'forms/' + name
            });
        })
    })

}

module.exports = EndpointServer;