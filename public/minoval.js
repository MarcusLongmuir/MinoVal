function MinoVal() {
    var minoval = this;
    minoval.init_path();
}

MinoVal.prototype.init_path = function(name, callback) {
    var minoval = this;
    var scripts = document.getElementsByTagName("script");
    for (var i=0; i<scripts.length; i++) {
        var script = scripts[i];
        if (script.src.indexOf('/minoval.js') != -1) {
            minoval.path = script.src.replace('/minoval.js', '');
            break;
        }
    }
}

MinoVal.create_fv_rule_from_object = function(object, callback) {
    var vr = new FVRule();
    var rule_error = vr.init(object);
    if(rule_error){
        console.error(rule_error);
        callback(rule_error);
    } else {
        callback(null, vr);
    }
}

MinoVal.prototype.get_type_rule = function(name, callback) {
    var minoval = this;
    console.log("minoval.get_type_rule", name);
    $.post(minoval.path + '/get_type_rule', {name: name}, function(type_object) {
        console.log(type_object);
        if (type_object === null) {
            callback({
                error_message: "Rule doesn't exist"
            });
            return;
        }

        MinoVal.create_fv_rule_from_object(type_object, callback);
    });
}

MinoVal.prototype.get_rule = function(name, callback) {
    var minoval = this;
    console.log("minoval.get_rule", name);
    $.post(minoval.path + '/get_rule', {name: name}, function(type_object) {
        console.log(type_object);
        if (type_object === null) {
            callback({
                error_message: "Rule was not found"
            });
            return;
        } else if (type_object.error !== undefined) {
            callback(type_object);
            return;
        }

        MinoVal.create_fv_rule_from_object(type_object, callback);
        
    });
}

minoval = new MinoVal();

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

