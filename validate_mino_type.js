var ValidationRule = require('fieldval-rules');
var logger = require('tracer').console()
var globals = require('./globals');
var get_endpoint_rule = require('./get_endpoint_rule')

module.exports = function(name, body) {
	var rule = globals.endpoints[name];
	logger.log(JSON.stringify(globals.endpoints, null, 4))
	var vr = new ValidationRule();
	var error = vr.init(rule);
	logger.log(error);

	return vr.validate(body)
}