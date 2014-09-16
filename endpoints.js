var logger = require('tracer').console();
var validate_mino_type = require('./validate_mino_type');

module.exports = function(server) {
	server.post('/test', function(req, res) {
		res.json(validate_mino_type('user', req.body))
	})
}