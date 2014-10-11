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
		
		var validation_rule = {
			type: 'object',
			fields: []
		}

		var find_rule = function(name, rule) {
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

		var build_rule = function(endpoint, rule, result) {
			logger.log(endpoint, rule, result)
			for (var key in endpoint) {
				if (typeof(endpoint[key]) === 'object') {
					
					var new_rule = find_rule(key, rule)
					logger.log(new_rule);
					if (new_rule !== undefined) {
						var new_result = {
							name: new_rule.name,
							display_name: new_rule.display_name,
							type: "object",
							fields: []
						}
						result.fields.push(new_result)

						build_rule(endpoint[key], new_rule, new_result)
					}

				} else {
					var new_rule = find_rule(key, rule);
					logger.log(key, new_rule);
					if (new_rule !== undefined) {
						result.fields.push(new_rule)
					}
				}
			}
		}

		var waiting_for = 0;
		
		var result = {
            "name" : name,
            "display_name" : name,
            "type" : "object",
            "fields" : []
		};

		for (var i in endpoint) {
			waiting_for++;
			(function(key) {

				minoval.get_type(key, function(err, res){
					var rule = res.objects[0].mino_type;
					logger.log(key, rule, endpoint);
					
					var new_result = {
						name: rule.name,
						display_name: rule.display_name,
						type: "object",
						fields: []
					}

					result.fields.push(new_result);

					build_rule(endpoint[key], rule, new_result)

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