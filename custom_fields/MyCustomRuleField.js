var logger;
if((typeof require) === 'function'){
	extend = require('extend')
}

extend(MyCustomRuleField, require('minodb').ValidationRule.RuleField);

function MyCustomRuleField(json, validator) {
    var field = this;

    MyCustomRuleField.superConstructor.call(this, json, validator);
}

MyCustomRuleField.prototype.create_ui = function(parent){
    var field = this;

    var ui_field = new ObjectField(field.display_name || field.name, field.json);
    ui_field.add_field("x", new TextField("x", {type: number}))
    ui_field.add_field("y", new TextField("y", {type: number}))

    parent.add_field(field.name, ui_field);
    return ui_field;
}

MyCustomRuleField.prototype.init = function() {
    var field = this;

    field.minimum = field.validator.get("minimum", BasicVal.number(false));
    if (field.minimum != null) {

    }

    field.maximum = field.validator.get("maximum", BasicVal.number(false));
    if (field.maximum != null) {

    }

    field.integer = field.validator.get("integer", BasicVal.boolean(false));

    return field.validator.end();
}

MyCustomRuleField.prototype.create_checks = function(){
    var field = this;
    
    field.checks.push(BasicVal.number(field.required));

    if(field.minimum){
        field.checks.push(BasicVal.minimum(field.minimum,{stop_on_error:false}));
    }
    if(field.maximum){
        field.checks.push(BasicVal.maximum(field.maximum,{stop_on_error:false}));
    }
    if(field.integer){
        field.checks.push(BasicVal.integer(false,{stop_on_error:false}));
    }
}

if (typeof module != 'undefined') {
    module.exports = MyCustomRuleField;
}