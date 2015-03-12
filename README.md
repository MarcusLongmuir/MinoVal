MinoVal
==========

MinoVal is a [MinoDB](https://github.com/MarcusLongmuir/MinoDB/) plugin enabling advance usage of Mino types.

##Features
* Create, store and use custom validation rules defined in MinoVal UI
* Validate data on the backend or frontend using either Mino types or custom validation rules.
* Create forms on the frontend using either Mino types or custom validation rules.
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

###validate(rule_name, object, callback)
Validates the ```object``` using custom validation rule by name.

###get_rule(rule_name, callback)
Returns a JSON object of the custom validation rule by name.

###get_type_rule(name, callback)
Returns a FVRule of a type or type field by name (i.e. both ```mino_user``` and ```mino_user.username``` valid).

###save_rule(rule, callback)
Saves custom validation rule.

###delete_rule(name, callback)
Deletes custom validation rule by name.

##Frontend

###Usage
Import fieldval, fieldlval-ui and fieldval-rules.
```html
<script type="text/javascript" src="/fieldval/fieldval.js"></script>
<script type="text/javascript" src="/fieldval-rules/fieldval-rules.js"></script>
<script type="text/javascript" src="/fieldval-ui/fieldval-ui.js"></script>
```
Then import minoval.js which is served by MinoVal plugin server: ```<MINO_PATH>/minoval/minoval.js```.
```html
<script type="text/javascript" src="/mino/minoval/minoval.js"></script>
```

###get_rule(name, callback)
Returns a FVRule object of custom validation rule by name.

###get_type_rule(type_name, callback)
Returns a FVRule object of Mino type by name.

[fieldval-rules](https://github.com/FieldVal/fieldval-rules-js) documentation covers FVRule usage.

#Examples
[mino-calendar-example](https://github.com/bestan/mino-calendar-example)
