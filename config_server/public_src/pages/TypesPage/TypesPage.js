SAFE.extend(TypesPage, Page);

function TypesPage(req) {
    var page = this;

    TypesPage.superConstructor.call(this);

    header.element.text("Create/Edit Endpoint");

    page.table = $("<table/>")

    page.fetch_data();

}

TypesPage.prototype.fetch_data = function() {
    var page = this;
    var query_string = get_query_params();

    var data = {};
    if (query_string.name !== undefined) {
        data.name = query_string.name;
    }

    $.post(minoval_path + 'get_types', data, function(res) {
        var types = res.types;
        var endpoint = res.endpoint;
        console.log(types);

        var vr = new ValidationRule();
    	var rule_error = vr.init(types);
        if(rule_error){
            console.error(rule_error);
            return;
        }

    	var form = vr.create_form();

    	page.element.append(
    		form.element.append(
    			$("<button />").text("Submit")
    		),
    		output = $("<pre />")
    	)

        if (endpoint !== undefined) {
            form.val(endpoint);
        }

        console.log(window.location.href, query_string);

        if (query_string.name !== undefined) {
            console.log("name", query_string.name);

            var name_field = form.fields.name;
            name_field.val(query_string.name);
            name_field.disable();
        }

    	form.on_submit(function(object){
    		console.log(object);
    	    var error = vr.validate(object);
    	  
    		if(error){
    			console.log(error);
    			form.error(error)
    			output.text('"error": '+JSON.stringify(error,null,4));
    		} else {
    			form.clear_errors();
    			output.text('"object": '+JSON.stringify(object,null,4));

    			var path = location.pathname.split('/');
    			var url = minoval_path + 'save_endpoint';

    			$.ajax({
    		        type: "POST",
    		        url: url,
    		        contentType: "application/json; charset=utf-8",
    		        dataType: "json",
    		        data: JSON.stringify(object),
    		        success: function(response) {
    		            SAFE.load_url(SAFE.path, true);
    		        },
    		        error: function(err, response) {
    		        	console.log(err, response);
    		        }
    		    })
    		}
    	})
    });
}

TypesPage.prototype.get_title = function() {
    var page = this;
    return null;
}

TypesPage.prototype.init = function() {
    var page = this;

}

TypesPage.prototype.remove = function() {
    var page = this;

}

TypesPage.prototype.resize = function(resize_obj) {
    var page = this;
}