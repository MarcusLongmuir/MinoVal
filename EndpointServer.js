var logger = require('tracer').console();

var express = require('express');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');

var http = require('http');
var path = require('path');

var globals = require("./globals");

function EndpointServer(){
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
        var types = [];
        globals.mino.api.call({username:"TestUser"},{
            "function": "search",
            parameters: {
                paths: [
                    "/Mino/types/"  
                ]
            }
        },function(err,types_res){
            for (var i=0; i<types_res.objects.length; i++) {
                types[types_res.objects[i].name] = types_res.objects[i].mino_type
            }
            logger.log(types)

            var html = '<form method="POST" action="create_endpoint">';
            for (var name in types) {
                var type = types[name];
                html += '<b>' + type.name +'</b><br>'
                logger.log(type.fields)
                if (type.fields) {
                    for (var j=0; j<type.fields.length; j++) {
                        var inner_type = type.fields[j]
                        logger.log(inner_type)
                        html+="<input type='checkbox' checked name='" + type.name + ":" + inner_type.name +"'>"
                        html+='' + inner_type.name + '<br>'
                    }
                }
            }
            html += '<input type="text" name="name"><br><button type="submit">Save</button></form>'
            res.send(html);
        });
    });

    us.express_server.post('/create_endpoint', function(req, res) {
        logger.log(req.body)

        var types = {}

        for (var key in req.body) {
            if (key.indexOf(':') != -1) {
                var type = key.split(':')[0]
                var field = key.split(':')[1]

                if (types[type] == undefined) {
                    types[type] = []
                }
                types[type].push(field)
            }
        }

        globals.mino.api.call({username:"TestUser"},{
            "function": "save",
            parameters: {
                objects: [
                    {
                        name: req.body.name,
                        path: "/TestUser/endpoints/",
                        mino_type: types
                    }
                ]
            }
        },function(err,response){
            res.redirect('/forms/'+req.body.name)
        })
    })

}

module.exports = EndpointServer;