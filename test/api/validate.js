var logger = require("tracer").console();
var assert = require("assert");
var globals = require('../globals');

describe("validate", function() {

	it('should validate a number with a number_rule ', function(done) {

		globals.minoval.validate("number_rule", 5, function(err, validator) {
			assert.equal(err, null);
			var val_error = validator.end();
			assert.equal(val_error, null);
			done();
		});

	});

	it('should not validate a string with a number_rule ', function(done) {

		globals.minoval.validate("number_rule", "s", function(err, validator) {
			assert.equal(err, null);
			var val_error = validator.end();
			logger.log(JSON.stringify(val_error, null, 4));
			assert.deepEqual(val_error, {
			    "error": 4,
			    "error_message": "Multiple errors.",
			    "errors": [
			        {
			            "error_message": "Incorrect field type. Expected number, but received string.",
			            "error": 2,
			            "expected": "number",
			            "received": "string"
			        },
			        {
			            "invalid": {
			                "0": {
			                    "error_message": "Unrecognized field.",
			                    "error": 3
			                }
			            },
			            "error_message": "One or more errors.",
			            "error": 5
			        }
			    ]
			});
			done();
		});

	});

	it('should not crash if rule does not exist', function(done) {
		globals.minoval.validate("non_existant_rule", {test:123}, function(err, validator) {
			assert.deepEqual(err, {
				"error":10001,
				"error_message":"Rule not found"
			});
			assert.equal(validator, undefined);
			done();
		});
	});
})