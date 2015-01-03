var logger = require('tracer').console();
var globals = require('./globals');
var assert = require('assert');

globals.db_address = 'mongodb://127.0.0.1:27017/minodb_tests';

describe('MinoVal', function() {
	before(require('./setup'));
	require('./initial_setup.js');

	require('./api/api');
});
