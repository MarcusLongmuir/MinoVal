MinoVal
==========

MinoVal is a [MinoDB](https://github.com/MarcusLongmuir/MinoDB/) plugin enabling advance usage of Mino types.

##Features
* Create, store and use custom validation rules defined in MinoVal UI
* Validate data on the backend or frontend using either Mino types or custom validation rules.
* Reference field of Mino types when defining new Mino type or creating custom validation rules.


#Example usage

```javascript
var MinoVal = require('minoval');
var minoval = new MinoVal({
  user: "my_app"
});
mino.add_plugin(minoval);
```

MinoVal config is be available on ```<MINO_PATH>/admin/plugins/minoval```. Use config UI for defining custom rules.

Browser now also have 'Mino field' available when defining types - you can use it for referencing fields of other types, i.e. ```mino_user.password```.


#Documentation
##Backend
```javascript
var minoval = new MinoVal(config);
```

Available config options:
* ```user```- username that should be making all API calls
* ```folder_name``` - name of the folder where MinoVal should store custom validation rules (```/<user>/<folder_name>```)

##validate(rule_name, object, callback)
Validates the ```object``` using custom validation rule that has a name of ```rule_name```.

##get_rule(rule_name, callback)
Returns a JSON object of the custom validation rule that has a name of ```rule_name```.

##get_type(type_name, callback)

##get_type_rule(type_name, callback)

##get_rule_object(rule_name, callback)

##save_rule(rule, callback)

##delete_rule(name, callback)

###Frontend
