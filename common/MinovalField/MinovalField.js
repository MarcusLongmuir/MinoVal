fieldval_ui_extend(MinovalField, FVChoiceField);

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