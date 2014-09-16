var globals = require('./globals')
var logger = require('tracer').console()

module.exports = function(name, callback) {
	var types = globals.types
	globals.mino.api.call({username:"TestUser"},{
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
		for (var key in keys) {
			logger.log(types, key)
			var found = false;
			var rule;
			for (var i=0; i<validation_rule.fields.length; i++) {
				if (validation_rule.fields[i].name == types[key].name) {
					found = true;
					rule = validation_rule.fields[i]
					break;
				}
			}
			if (!found) {
				rule = {
					name: types[key].name,
					display_name: types[key].display_name,
					type: types[key].type,
					fields: []
				}
				validation_rule.fields.push(rule)
			}

			logger.log(rule)
			for (var i=0; i<keys[key].length; i++) {
				var field_name = keys[key][i]
				logger.log(field_name)
				logger.log(validation_rule)
				for (var j=0; j<types[key].fields.length; j++) {
					var field = types[key].fields[j];
					if (field.name == field_name) {
						rule.fields.push(field)		
					}
				}
				
			}
			logger.log(validation_rule)
			
		}
		callback(validation_rule);
	})
}
