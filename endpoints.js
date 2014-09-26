var logger = require('tracer').console();
var MinoVal = require('./MinoVal');
var globals = reuqire('./globals');

module.exports = function(server) {
	server.post('/test', function(req, res) {
		logger.log(req.body);
		globals.minoval.validate('test', req.body, function(validator) {
			var error = validator.end();
			logger.log(error);
			res.json(error);
		});
	})
}