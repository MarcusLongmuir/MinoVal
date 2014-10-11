var FieldVal = require('fieldval');
var logger = require('tracer').console();
var fieldval_rules = require('fieldval-rules');

var EndpointServer = require('./EndpointServer');
var ExampleServer = require('./ExampleServer');

function MinoVal(mino) {
	var minoval = this;
	minoval.mino = mino;
	minoval._endpoint_server = new EndpointServer(minoval);
	minoval._example_server = new ExampleServer(minoval);
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
	minoval.mino.api.call({username:"TestUser"},{
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
				var next_reuslt = minoval.create_object_rule(next_field.name, next_field.display_name);
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

MinoVal.prototype.get_endpoint_rule = function(name, callback) {
	var minoval = this;
	minoval.mino.api.call({username:"TestUser"},{
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


module.exports = MinoVal;