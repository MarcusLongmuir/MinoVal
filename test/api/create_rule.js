var assert = require('assert');
var globals = require('../globals');

describe("create rule", function() {

	it('should create a number rule', function(done) {

		globals.minoval.save_rule({
			name: "number_rule",
			mino_type: {
				name: "number_rule",
				type: "number"
			}
		}, function(err, res) {
			assert.equal(err, null);

			logger.log(JSON.stringify(res, null,4));
			assert.equal(res.objects[0].full_path, "/testuser/minoval_rules/number_rule");
			done();
		})

	});


})