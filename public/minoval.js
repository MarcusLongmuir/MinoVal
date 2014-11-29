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


MinoVal.prototype.get_rule = function(name, callback) {
    var minoval = this;
    console.log("test");
    $.post(minoval.path + '/get_endpoint', {name: name}, function(type_object) {
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

minoval = new MinoVal();