if((typeof require) === 'function'){
    extend = require('extend');
    FVRule = require('minodb').FVRule;
    FVRuleField = require('minodb').FVRule.FVRuleField;
    FieldVal = require("fieldval");
    BasicVal = FieldVal.BasicVal;
}

if (typeof extend !== 'undefined') {
	extend(MinoRuleField, FVRuleField);
} else {
	fieldval_ui_extend(MinoRuleField, FVRuleField);
}

function MinoRuleField(json, validator) {
	var field = this;
	MinoRuleField.superConstructor.call(this, json, validator);
}

MinoRuleField.prototype.create_ui = function(form){
	var field = this;

	field.ui_field = new FVProxyField(field.display_name || field.name, {form:form});

	minoval.get_type_rule(field.mino_field, function(err, vr) {
		var inner_field = vr.field.create_ui(parent);
		console.log(inner_field);
        field.ui_field.replace(inner_field);
	});


	field.element = field.ui_field.element;
	return field.ui_field;
};

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
};

MinoRuleField.add_editor_params = function(editor, value) {
	var field = this;
	minoval.get_types(function(err, types) {
        editor.add_field("mino_field", new MinovalField("Mino field", {
			types: types
		}));
		editor.fields.mino_field.val(value.mino_field);
		if (editor.is_disabled) {
			editor.fields.mino_field.disable();
		}
    });
};

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
