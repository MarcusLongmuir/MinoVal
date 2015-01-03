if((typeof require) === 'function'){
    extend = require('extend')
    FVRule = require('minodb').FVRule;
    FVRuleField = require('minodb').FVRule.FVRuleField;
    // minoval = require('../minoval.js').global_client;
    // minoval = new MinoVal({user:"testuser"});
    logger = require('tracer').console();
    globals = require('../globals');
    minoval = globals.minoval_client;
}

extend(MinovalRuleField, FVRuleField);

function MinovalRuleField(json, validator) {
	var field = this;
	MinovalRuleField.superConstructor.call(this, json, validator);
}

MinovalRuleField.prototype.create_ui = function(parent, form){
	var field = this;

	field.ui_field = new FVTextField(field.name).val("Loading...").disable();

	minoval.get_type_rule(field.minoval_field, function(err, vr) {
		field.ui_field.remove();
		vr.field.create_ui(parent, form);
	});

	parent.add_field(field.name, field.ui_field);

	return field.ui_field;
}

MinovalRuleField.prototype.init = function() {
	var field = this;

	field.minoval_field = field.validator.get("minoval_field", BasicVal.string(true));

	field.checks.push(function(value, emit, done) {
		minoval.get_type_rule(field.minoval_field, function(err, vr) {
			vr.validate(value, function(error) {
				done(error);
			});
		});

	});

	return field.validator.end();
}

if (typeof module != 'undefined') {
    module.exports = MinovalRuleField;
}

FVRuleField.add_field_type({
    name: 'minoval_field',
    display_name: 'Minoval field',
    class: MinovalRuleField
});
