var FieldVal = require('fieldval');
var logger = require('tracer').console();
var express = require('express');
var path = require('path');
var fieldval_rules = require('fieldval-rules');
var MinoSDK = require('minosdk');
var FVRule = require('minodb').FVRule;
var FVRuleField = require('minodb').FVRule.FVRuleField;
var BasicVal = require('fieldval-basicval');
var errors = require('./errors');

var ConfigServer = require('./config_server/ConfigServer');

function MinoVal(options) {
	var minoval = this;
	minoval.user = options.user;

	minoval.main_server_path = '/minoval';

	minoval.folder_name = options.folder_name || "minoval_rules";
	minoval.path = "/"+minoval.user+"/" + minoval.folder_name + "/";

	minoval.config_server = new ConfigServer(minoval);

	minoval.main_server = express()
    minoval.main_server.use(express.static(path.join(__dirname, './public')));

    minoval.main_server.post('/get_type_rule', function(req, res) {
        logger.log(req.body.name);
        minoval.get_rule_object(req.body.name, function(err, rule) {
            logger.log(err, rule);
            if (err) {
            	res.json(err);
            } else {
            	res.json(rule);	
            }
        });
    });

    minoval.main_server.post('/get_rule', function(req, res) {
        logger.log(req.body.name);
        minoval.get_rule(req.body.name, function(err, rule) {
        	logger.log(err, rule);
            if (err) {
            	res.json(err);
            } else {
            	res.json(rule.mino_type);	
            }
        });
    });

    minoval.main_server.post("/get_types", function(req, res) {
        var types = {
            "name" : "types",
            "display_name" : "Types",
            "type" : "object",
            "fields" : []
        };
        
        minoval.minodb.api.call({username:minoval.user},{
            "function": "search",
            parameters: {
                paths: [
                    "/Mino/types/"  
                ]
            }
        },function(err,types_res){
            for (var i=0; i<types_res.objects.length; i++) {
                var type = types_res.objects[i].mino_type
                types.fields.push(type);
            }
            logger.log('received types', JSON.stringify(types, null, 4))

            var json_response = {
                types: types
            }

            if (req.body.name !== undefined) {
                minoval.get_rule(req.body.name, function(err, rule) {
                    json_response.rule = rule;
                    res.json(json_response);
                })   
            } else {
                res.json(json_response);
            }
        });
    });

}

MinoVal.global_client = "test";

MinoVal.prototype.get_config_server = function(){
    var minoval = this;
    return minoval.config_server.express_server;
}

MinoVal.prototype.info = function(){
    var minoval = this;

    return {
        name: "minoval",
        display_name: "MinoVal"
    };
}

MinoVal.prototype.init = function(minodb, callback){
    var minoval = this;
    minoval.minodb = minodb;

    minodb.internal_server().use(minoval.main_server_path, minoval.main_server);
    minoval.create_folders(callback);

    require('./common/MinoRuleField.js').init(minoval);

    minodb.add_field_type({
    	name: "mino_field",
    	display_name: "Mino field",
    	class: require('./common/MinoRuleField.js').field
    })
}

MinoVal.prototype.get_scripts = function() {
	var minoval = this;
	var path = minoval.main_server_path;
	if (path.charAt(0) == '/') {
		path = path.substring(1, path.length);
	}
	return [path + "/minoval.js"];
}

MinoVal.prototype.create_folders = function(callback) {
    var minoval = this;
    minoval.sdk = new MinoSDK(minoval.user);
    minoval.sdk.set_local_api(minoval.minodb.api);
    minoval.sdk.call({
       "function": "save",
        "parameters": {
            "objects" : [{
                "name": minoval.folder_name,
                "path": "/" + minoval.user + "/",
                "folder": true
            }]
        } 
    }, function(err, res) {
        logger.log(JSON.stringify(err, null, 4), res); 
        if (callback !== undefined) {
            callback();
        }   
    })
}

MinoVal.prototype.validate = function(name, params, callback) {
	var minoval = this;
	minoval.get_rule(name, function(err, rule) {
		if (err) {
			callback(err);
			return;
		}
		var rule = rule.mino_type;
     	var vr = new FVRule();
     	var error = vr.init(rule);
    	
     	if (error) {
     		callback(error);
     		return;
     	}

    	vr.validate(params, function(error) {
    		var validator = new FieldVal(params, error);
    		callback(null, validator);
        });

		
	});
}

MinoVal.prototype.get_type = function(name, callback) {
	var minoval = this;
	minoval.minodb.api.call({username:minoval.user},{
		"function": "get",
		parameters: {
			addresses: [
				"/Mino/types/"+name	
			]
		}
	}, function(err, res) {
		logger.log(err, res);
		if (err) {
			callback(err)
		} else {
			callback(null, res.objects[0]);
		}
	});
}

MinoVal.prototype.get_rule = function(name, callback) {
	var minoval = this;
	minoval.minodb.api.call({username:minoval.user},{
		"function": "get",
		parameters: {
			addresses: [
				minoval.path+name	
			]
		}
	},function(err,res){
		if (err) {
			callback(err);
			return;
		}
		logger.log(res.objects[0])

		if (res.objects[0] == undefined) {
			callback(errors.RULE_NOT_FOUND)
			return;
		}
		var rule = res.objects[0];

		callback(err, rule);
	});
}

MinoVal.prototype.get_type_rule = function(name, callback) {
	var minoval = this;

	minoval.get_rule_object(name, function(err, rule) {
		if (err) {
			callback(err);
			return;
		}

		var vr = new FVRule();
		var init_error = vr.init(rule);
		if (init_error) {
			callback(init_error)
			return;
		}

		callback(null, vr);

	});
}

MinoVal.prototype.get_rule_object = function(name, callback) {
	var minoval = this;

	var parts = name.split(".");
	if (parts.length == 0  || !parts[0]) {
		callback(errors.RULE_NOT_FOUND);
	} else if (parts[parts.length-1] == "") {
		parts = parts.slice(0, parts.length-1);
	}

	logger.log(parts);

	minoval.get_type(parts[0], function(err, type) {
		logger.log(type);

		var rule = type.mino_type;
		for (var i=1; i<parts.length; i++) {
			logger.log(i, rule.fields, parts[i]);

			var found = false;
			
			for (var j=0; j<rule.fields.length; j++) {
				if (rule.fields[j].name == parts[i]) {
					rule = rule.fields[j];
					found = true;
					break;
				}
			}

			if (!found) {
				rule = null;
				break;	
			}

		}
		logger.log(rule);
		callback(null, rule);
	})	
}

MinoVal.prototype.save_rule = function(object, callback) {
	var minoval = this;

	var err = MinoVal.validate_rule_data(object.mino_type);
	if (err) {
		callback(err)
		return;
	}

	if (object.name == undefined) {
		object.name = object.mino_type.name;
	}
	if (object.path == undefined) {
		object.path = minoval.path;
	}
	logger.log(object);

	minoval.minodb.get([object.path + object.name], function(err, res) {
		logger.log(JSON.stringify(err, null, 4), res);

		var db_object = res.objects[0];
		if (db_object != null && object["_id"] !== db_object["_id"]) {
			logger.log(errors);
			callback(
				new FieldVal(null)
				.invalid("name", errors.RULE_ALREADY_EXISTS)
				.end()
			)
			return;
		}

		object.name = object.mino_type.name;

		logger.log(object);

		minoval.minodb.save([object], function(err, res) {
			logger.log(JSON.stringify(err, null, 4), res);
			if (err) {
				callback(err);
				return;
			}

			callback(null, res);
		})
	});

}

MinoVal.prototype.delete_rule = function(name, callback) {
	var minoval = this;
	minoval.minodb.api.call({username:minoval.user},{
		"function": "delete",
		parameters: {
			addresses: [
				minoval.path+name	
			]
		}
	},function(err,res){
		callback(err, res);
	});
}

MinoVal.validate_rule_data = function(data) {
	var rule = new FVRule();
	var type_error = rule.init(
	    data,
	    {
	        need_name: true
	        // allow_dots: false
	    }
	);

	//Perform an extra check on the name
	var validator = new FieldVal(data, type_error);
	validator.get("name", BasicVal.string(true), BasicVal.start_with_letter(), BasicVal.no_whitespace());

	return validator.end();
}

module.exports = MinoVal;
