var logger = require('tracer').console();
var express = require('express');
var connect = require('connect');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');

var MinoDB = require('minodb');
var mino = new MinoDB({
    api: true,
    ui: true,
    db_address: 'mongodb://127.0.0.1:27017/minodb'
})

mino.add_field_type({
	name: "custom_field",
	display_name: "Custom Field",
	class: require('./custom_fields/MyCustomRuleField')
})

var server = express();
server.set('port', process.env.PORT || 5002);
server.set('views', path.join(__dirname, 'views'));
//server.set('view engine', 'jade')
server.use(express.static(path.join(__dirname, './bower_components')));;
server.use(express.errorHandler());
server.use(bodyParser());
server.engine('mustache', mustacheExpress());
server.set('view engine', 'mustache');

server.use('/api/', mino.api_server())
server.use('/ui/', mino.ui_server())

var types = {}
var endpoints = {}

var globals = require('./globals')
globals.mino = mino;
globals.types = types
globals.endpoints = endpoints;

function load_types_and_endpoints(callback) {
	mino.api.call({username:"TestUser"},{
		"function": "search",
		parameters: {
			paths: [
				"/Mino/types/"	
			]
		}
	},function(err,res){
		for (var i=0; i<res.objects.length; i++) {
			types[res.objects[i].name] = res.objects[i].mino_type
		}
		logger.log(types)


		mino.api.call({username:"TestUser"},{
			"function": "search",
			parameters: {
				paths: [
					"/TestUser/endpoints/"	
				]
			}
		}, function(err, res) {
			var fetched = 0;
			var endpoints_length = res.objects.length
			for (var i=0; i<res.objects.length; i++) {
				var endpoint_name = res.objects[i].name;
				(function(endpoint_name) {
					require('./get_endpoint_rule')(endpoint_name, function(res) {
						logger.log(endpoint_name, JSON.stringify(res, null, 4))
						globals.endpoints[endpoint_name] = res
						fetched++;
						if (fetched == endpoints_length) {
							if (callback) {
								callback();
							}
						}
					})	
				})(endpoint_name)
			}
		})
		
	})
}

mino.api.connect(function(){

	require('./initial_data')(mino, function(err, res) {
		load_types_and_endpoints();	
	})

})

server.get('/types', function(req,res) {
	var html = '<form method="POST" action="/create_endpoint">';
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
})

server.post('/create_endpoint', function(req, res) {
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

	mino.api.call({username:"TestUser"},{
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
		load_types_and_endpoints(function() {
			logger.log('redirecting')
			res.redirect('/forms/'+req.body.name)
		});
	})
})

server.get('/forms/:name', function(req, res) {	
	require('./get_endpoint_rule')(req.params.name, function(rule) {
		logger.log(req.params.name, JSON.stringify(rule, null, 4))
		var params = {
			rule: JSON.stringify(rule)
		}
		logger.log(JSON.stringify(rule))
		logger.log(params);
		res.render('form.mustache', params);
	})	
	
});

server.get('/get_endpoint', function(req, res) {

})

require('./endpoints')(server)

// server.get('/*', function(req, res) {
//     res.render('index');
// })

http.createServer(server).listen(server.get('port'), function() {
    console.log('Server started on port ' + server.get('port'));
});