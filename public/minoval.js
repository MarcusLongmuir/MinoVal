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

MinoVal.prototype.get_types = function(callback) {
    var minoval = this;
    
    $.post(minoval.path + '/get_types', function(res) {
        callback(null, res.types);
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

MinoRuleField.add_editor_params = function(editor) {
	var field = this;
	console.log("adding minoval field");
	minoval.get_types(function(err, types) {
        console.log('feteched types');
        editor.add_field("mino_field", new MinovalField("Mino field", {
			types: types
		}));
		var value = editor.val();
		editor.fields.mino_field.val(value.mino_field);
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

extend(MinovalField, FVChoiceField);

function MinovalField(name, options) {
	var field = this;
    field.types = options.types;

    MinovalField.superConstructor.call(this, name, options);
	field.element.addClass("minoval_field")
}

MinovalField.prototype.filter_esc_up = function() {
    var field = this;
    field.finish_selecting(field.filter_input.val());
}

MinovalField.prototype.filter_key_down = function(e) {
    var field = this;
    FVChoiceField.prototype.filter_key_down.call(this, e);
    
    if(e.keyCode!=38 && e.keyCode!=40 && e.keyCode!=13){
        //Reset selection on keypress unless it's navigation
        field.selected_object = null;
    }
}

MinovalField.prototype.auto_complete_value = function(value) {
    var field = this;

    var complete_parts = field.get_complete_parts();

    console.log('AUTOCOMPLETE', complete_parts, value);
    
    if (complete_parts !== "") {
        return complete_parts + "." + value
    } else {
        return value;
    }
}

MinovalField.prototype.get_complete_parts = function() {
    var field = this;
    
    var text = field.filter_input.val();
    var array = text.split(".");

    var last_part_boundary = array.length - 1;
    
    if (field.selected_object) {
        //Selected object is valid - include it
        last_part_boundary = array.length;
    }
    
    array = array.slice(0, last_part_boundary);
    return array.join(".");
}


//TODO REFACTOR
MinovalField.prototype.get_last_object = function(text, is_completed) {
    var field = this;

    console.log(text);
    var array = text.split('.');
    console.log(text, array, text[text.length-1], array.length);
    if (array.length <= 1 && !is_completed) {
        return field.types;
    }

    console.log(text);
    if (!is_completed) {
        array = array.slice(0, array.length-1);
        text = array.join(".");
    }

    console.log('LAST OBJECT ARRAY', array);

    var check_recursively = function(object, field_number) {
        var field_name = array[field_number];
        console.log("RECURSIVE CHECK", field_name, field_number, object);
        if (field_number >= array.length) {
            console.log("FINISHED", object, field_name);
            return object;
        }

        if (object.type == "object" && object.fields !== undefined) {
            for (var i=0; i<object.fields.length; i++) {
                var object_field = object.fields[i];
                console.log("CHECKING", object_field.name, field_name)
                if (object_field.name == field_name) {
                    return check_recursively(object_field, field_number+1);
                }
            }
        }

        console.log('FAILED', object, field_name);
    }

    return check_recursively(field.types, 0);

}


//TODO REFACTOR
MinovalField.prototype.filter = function(text, initial){
    var field = this;

    field.choice_list.empty();
    field.option_array = [];

    var current_object = field.selected_object;
    var text_lower = "";
    
    if (!current_object || text == "") {
        current_object = field.get_last_object(text, field.is_completed || false);
        var array = text.split(".");
        text_lower = array[array.length-1].toLowerCase();
    }
    console.log("FILTER", current_object, text_lower);

    var choice_match = function(choice_text) {
    	return choice_text==="" && text_lower===""
	    	    ||
	        choice_text.toLowerCase().indexOf(text_lower)==0
    }

    console.trace();
    console.log(current_object);

    if (current_object.type == 'object' && current_object.fields !== undefined) {

    	for(var i=0; i < current_object.fields.length; i++){
    	    var object_field = current_object.fields[i];
    	    var choice_text = object_field.name;

            console.log('FILTERING', object_field, choice_text);
    	    if(choice_match(choice_text)) {
                var choice_option = new FVChoiceOption(choice_text, field);
    	        field.add_option(choice_option);
                field.option_array.push(choice_option);
    	    }
    	}	

    } else {
    	if(choice_match(current_object.name)) {
            var choice_option = new FVChoiceOption(current_object.name, field);
	        field.add_option(choice_option);
            field.option_array.push(choice_option);
	    }
    }

    if(!initial || !field.current_highlight){
        field.current_highlight = field.option_array[0];
        console.log('ypy', field.current_highlight);
    }
    if(field.current_highlight){
        field.current_highlight.add_highlight();
    }
}

MinovalField.prototype.value_to_text = function(value){
    var field = this;
    return value;
}

MinovalField.prototype.select_option = function(choice_option, ignore_change){
    var field = this;

    var filter_text = field.auto_complete_value(choice_option.choice_value);
    console.log('FILTER TEXT', filter_text);
    last_object = field.get_last_object(filter_text, true);

    console.log("LAST OBJECT", last_object);
    field.filter_input.val(filter_text);
    
    if (last_object.fields == undefined || last_object.fields.length == 0) {
        field.finish_selecting(filter_text, ignore_change);
        return;
    }

    field.selected_object = last_object;
    field.filter(field.filter_input.val());

}

MinovalField.prototype.finish_selecting = function(value, ignore_change) {
    var field = this;

    field.selected_object = field.get_last_object(value, true);

    if(value===null){
        field.current_display.addClass("fv_choice_placeholder").text(field.name);
    } else {
        field.current_display.removeClass("fv_choice_placeholder").text(value); 
    }

    field.hide_list();

    // field.filter_input.blur().hide();
    
    if(!ignore_change){
        field.did_change();
    }
}

MinovalField.prototype.focus = function() {
    var field = this;
    
    setTimeout(function(){
        field.show_list();
    },1);

    return field;
}

MinovalField.prototype.val = function(set_val) {
    var field = this;

    console.log("VAL", set_val);

    if (arguments.length===0) {
        var text = field.current_display.text()
        if (text.length == 0) {
            return null;
        }
        return text;
    } else {
        console.log("SET VAL", set_val);
        if (set_val !== undefined) {
            field.finish_selecting(set_val, true);
        }
        return field;
    }
}

MinovalField.prototype.remove = function(from_parent) {
    var field = this;
    field.current_display.text("");
    return FVChoiceField.prototype.remove.call(this, from_parent);
}
