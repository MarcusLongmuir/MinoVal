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

		var keys = res.objects[0].mino_type;
		var validation_rule = {
			type: 'object',
			fields: []
		}
		logger.log(keys)
		var completed = 0;
		for (var key in keys) {
			minoval.get_type(key, function(err, res) {
				completed++;
				logger.log(err,res.objects);
				var type = res.objects[0].mino_type;
				var found = false;
				var rule;
				for (var i=0; i<validation_rule.fields.length; i++) {
					if (validation_rule.fields[i].name == type.name) {
						found = true;
						rule = validation_rule.fields[i]
						break;
					}
				}
				if (!found) {
					rule = {
						name: type.name,
						display_name: type.display_name,
						type: type.type,
						fields: []
					}
					validation_rule.fields.push(rule)
				}

				logger.log(rule)
				for (var i=0; i<keys[key].length; i++) {
					var field_name = keys[key][i]
					logger.log(field_name)
					logger.log(validation_rule)
					for (var j=0; j<type.fields.length; j++) {
						var field = type.fields[j];
						if (field.name == field_name) {
							rule.fields.push(field)		
						}
					}
					
				}
				logger.log(JSON.stringify(validation_rule, null,4));
				if (completed == Object.keys(keys).length) {
					callback(validation_rule);
				}
			}); 
			
		}
	})
}


module.exports = MinoVal;