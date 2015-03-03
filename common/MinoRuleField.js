if((typeof require) === 'function'){
    extend = require('extend')
    FVRule = require('minodb').FVRule;
    FVRuleField = require('minodb').FVRule.FVRuleField;
    // minoval = require('../minoval.js').global_client;
    // minoval = new MinoVal({user:"testuser"});
    logger = require('tracer').console();
    FieldVal = require("fieldval");
    BasicVal = FieldVal.BasicVal;
}

extend(MinoRuleField, FVRuleField);

function MinoRuleField(json, validator) {
	var field = this;
	MinoRuleField.superConstructor.call(this, json, validator);
}

MinoRuleField.prototype.create_ui = function(form){
	var field = this;

	field.ui_field = new FVProxyField(field.display_name || field.name, {form:form});
	field.ui_field.on_change(function(){
	    console.log("UI FIELD ON CHANGE",arguments);
	})

	minoval.get_type_rule(field.mino_field, function(err, vr) {
		var inner_field = vr.field.create_ui(parent);
		console.log(inner_field);
        field.ui_field.replace(inner_field);
	});


	field.element = field.ui_field.element;
	return field.ui_field;
}

MinoRuleField.prototype.init = function() {
	var field = this;

	field.mino_field = field.validator.get("mino_field", BasicVal.string(true));

	field.checks.push(function(value, emit, done) {
		minoval.get_type_rule(field.mino_field, function(err, vr) {
			vr.validate(value, function(error) {
				done(error);
			});
		});

	});

	return field.validator.end();
}

MinoRuleField.create_editor_ui = function(value, form) {
	var field = this;
	minoval.get_types(function(err, types) {
        form.add_field("mino_field", new MinovalField("Mino field", {
			types: types
		}));
		form.fields.mino_field.val(value.mino_field);
    });
}

if (typeof module != 'undefined') {
    module.exports.field = MinoRuleField;
    module.exports.init = function(local_minoval) {
    	minoval = local_minoval;
    };
}

FVRuleField.add_field_type({
    name: 'mino_field',
    display_name: 'Mino field',
    class: MinoRuleField
});
