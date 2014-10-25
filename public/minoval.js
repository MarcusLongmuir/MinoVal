function MinoVal(path) {
    var minoval = this;
    minoval.path = path;
}

MinoVal.prototype.get_rule = function(name, callback) {
    var minoval = this;
    console.log("test");
    $.post(minoval.path + 'get_endpoint', {name: name}, function(type_object) {
        if (type_object === null) {
            callback({
                error_message: "Rule doesn't exist"
            });
            return;
        }

        var vr = new ValidationRule();
        console.log(type_object);
        console.log(vr);
        var rule_error = vr.init(type_object);
        if(rule_error){
            console.error(rule_error);
            callback(rule_error);
            return;
        }

        callback(null, vr);
    });
}

