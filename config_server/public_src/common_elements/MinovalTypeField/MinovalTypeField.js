extend(MinovalTypeField, TypeField);

function MinovalTypeField(value, parent, types) {
	var tf = this;
	tf.types = types;
	MinovalTypeField.superConstructor.call(this, value, parent);
}

MinovalTypeField.prototype.update_type_fields = function() {
	var tf = this;
	TypeField.prototype.update_type_fields.call(this);

	var type = tf.form.fields.type.val();

	if (type == "minoval_field") {
		tf.form.add_field("minoval_field", new MinovalField("Minoval field", {
			types: tf.types
		}));
		tf.form.fields.minoval_field.val(tf.value.minoval_field);
	}
	console.log(type);
}
