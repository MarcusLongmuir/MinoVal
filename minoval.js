var FieldVal = require('fieldval');
var logger = require('tracer').console();
var express = require('express');
var fieldval_rules = require('fieldval-rules');

var EndpointServer = require('./endpoint_server/EndpointServer');
var ExampleServer = require('./example_server/ExampleServer');

function MinoVal(options) {
	var minoval = this;

	minoval.path = options.path || '/minoval/';

	var endpoint_server = new EndpointServer(minoval);
	minoval.express_server = endpoint_server.express_server;


	if (options.example_path !== undefined) {
		minoval.example_path = options.example_path;
		var example_server = new ExampleServer(minoval);
		minoval.example_express_server = example_server.express_server;
	}	

	minoval.config_server = express();
    minoval.config_server.get('*', function(req, res){
        res.send("MinoVal config")
    })
}

MinoVal.prototype.get_config_server = function(){
    var minoval = this;
    logger.log("getting config server");
    return minoval.config_server;
}

MinoVal.prototype.info = function(){
    var minoval = this;

    return {
        name: "minoval",
        display_name: "MinoVal"
    };
}

MinoVal.prototype.init = function(minodb){
    var minoval = this;

    minoval.minodb = minodb;
    logger.log(minoval.example_path, minoval.example_express_server);
    
    if (minoval.example_path !== undefined) {
	    minodb.server().use(minoval.example_path, minoval.example_express_server);
    }

    logger.log(minoval.path);
    minodb.server().use(minoval.path, minoval.express_server);
}

MinoVal.prototype.validate = function(rule_name, params, callback) {
	var minoval = this;
	minoval.get_endpoint_rule(rule_name, function(rule) {
		
		logger.log(fieldval_rules);
		logger.log(JSON.stringify(fieldval_rules, null, 4));
    	
    	var ObjectRuleField = fieldval_rules.RuleField.types['object'].class;
        var object_rule_field = new ObjectRuleField(rule);
        object_rule_field.init();
        var error = object_rule_field.validate(params);

		logger.log(JSON.stringify(rule, null, 4));
		logger.log(JSON.stringify(params, null, 4));
		logger.log(JSON.stringify(error, null, 4));
	
		var validator = new FieldVal(params, error);

		callback(validator);
	});
}

MinoVal.prototype.get_type = function(name, callback) {
	var minoval = this;
	minoval.minodb.api.call({username:"TestUser"},{
		"function": "get",
		parameters: {
			addresses: [
				"/Mino/types/"+name	
			]
		}
	}, function(err, res) {
		callback(err,res)
	});
}

MinoVal.prototype.endpoint_server = function() {
	var minoval = this;
	return minoval._endpoint_server.express_server;
}

MinoVal.prototype.example_server = function() {
	var minoval = this;
	return minoval._example_server.express_server;
}

MinoVal.prototype.create_object_rule = function(name, display_name) {
	return {
		name: name,
		display_name: display_name,
		type: "object",
		fields: []
	}
}

MinoVal.prototype.find_field_in_object = function(name, rule) {
	var minoval = this;
	logger.log(name, rule)
	if (rule.fields === undefined) {
		return
	}

	for (var i=0; i < rule.fields.length; i++) {
		var field = rule.fields[i]
		if (name === field.name) {
			return field
		}
	}
}

MinoVal.prototype.get_endpoint_rules_from_object = function(endpoint, object, result) {
	var minoval = this;
	logger.log(endpoint, object, result)
	for (var key in endpoint) {
		if (typeof(endpoint[key]) === 'object') {

			//Object - inspect each child field recursively
			
			var next_field = minoval.find_field_in_object(key, object);
			if (next_field !== undefined) {
				var next_result = minoval.create_object_rule(next_field.name, next_field.display_name);
				result.fields.push(next_result)
				minoval.get_endpoint_rules_from_object(endpoint[key], next_field, next_result);
			}

		} else {

			//Field - add to the rule

			var next_field = minoval.find_field_in_object(key, object);
			logger.log(key, next_field);
			if (next_field !== undefined) {
				result.fields.push(next_field);
			}
		}
	}
}

MinoVal.prototype.get_endpoint = function(name, callback) {
	var minoval = this;
	minoval.minodb.api.call({username:"TestUser"},{
		"function": "get",
		parameters: {
			addresses: [
				"/TestUser/endpoints/"+name	
			]
		}
	},function(err,res){
		if (err) {
			callback(err);
			return;
		}
		logger.log(res.objects[0])

		if (res.objects[0] == undefined) {
			callback(null)
			return;
		}
		var endpoint = res.objects[0].mino_type;

		callback(err, endpoint);
	});
}

MinoVal.prototype.get_endpoint_rule = function(name, callback) {
	var minoval = this;
	minoval.get_endpoint(name, function(err, endpoint) {
		logger.log(endpoint);

		var waiting_for = 0;
		
		var result = minoval.create_object_rule(name, name);

		for (var i in endpoint) {
			waiting_for++;
			(function(key) {

				minoval.get_type(key, function(err, res){
					var rule = res.objects[0].mino_type;
					logger.log(key, rule, endpoint);
					
					var next_result = minoval.create_object_rule(rule.name, rule.dsplay_name);
					result.fields.push(next_result);

					minoval.get_endpoint_rules_from_object(endpoint[key], rule, next_result)

					waiting_for--;
					if (waiting_for == 0) {
						logger.log(JSON.stringify(result, null, 4));
						callback(result);
					}
				});
			})(i);
		}

	})
}

MinoVal.prototype.save_endpoint = function(name, types, callback) {
	var minoval = this;

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
	minoval.minodb.api.call({username:"TestUser"},{
	    "function": "get",
	    parameters: {
	        addresses: [
	            "/TestUser/endpoints/"+name,
	        ]
	    }
	},function(err,response){
	  	
		var object = {
            name: name,
            path: "/TestUser/endpoints/",
            mino_type: types
        };

        logger.log(err, response);

        if (response.objects[0] !== undefined && response.objects[0] !== null) {
        	object['_id'] = response.objects[0]['_id']
        }

		minoval.minodb.api.call({username:"TestUser"},{
		    "function": "save",
		    parameters: {
		        objects: [
		            object
		        ]
		    }
		},function(err,response){
		    callback(err, response);
		})
	})

}

MinoVal.prototype.get_types_as_booleans = function(callback) {
	var minoval = this;

	var types = {
	    "name" : "types",
	    "display_name" : "types",
	    "type" : "object",
	    "fields" : []
	};
	
	minoval.minodb.api.call({username:"TestUser"},{
	    "function": "search",
	    parameters: {
	        paths: [
	            "/Mino/types/"  
	        ]
	    }
	},function(err,types_res){

	    var convert_object_fields_to_booleans = function(object, result) {
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
	                convert_object_fields_to_booleans(field, new_result)
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

	    convert_object_fields_to_booleans(types, boolean_types);
	    boolean_types.fields.push({
	        name: "name",
	        display_name: "Name",
	        type: "text"
	    })

	    callback(null, boolean_types);
	    
	});
}

MinoVal.prototype.delete_endpoint = function(name, callback) {
	var minoval = this;
	minoval.minodb.api.call({username:"TestUser"},{
		"function": "delete",
		parameters: {
			addresses: [
				"/TestUser/endpoints/"+name	
			]
		}
	},function(err,res){
		callback(err, res);
	});
}

module.exports = MinoVal;