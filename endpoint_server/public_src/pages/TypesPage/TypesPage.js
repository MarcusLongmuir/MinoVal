SAFE.extend(TypesPage, Page);

function TypesPage(req) {
    var page = this;

    TypesPage.superConstructor.call(this);

    header.element.text("Create new endpoint");

    page.table = $("<table/>")

    page.fetch_data();

}

TypesPage.prototype.fetch_data = function() {
    var page = this;
    $.post(minoval_path + 'get_types', function(types) {
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
    			var url = minoval_path + 'create_endpoint';

    			$.ajax({
    		        type: "POST",
    		        url: url,
    		        contentType: "application/json; charset=utf-8",
    		        dataType: "json",
    		        data: JSON.stringify(object),
    		        success: function(response) {
    		            SAFE.load_url(SAFE.path);
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