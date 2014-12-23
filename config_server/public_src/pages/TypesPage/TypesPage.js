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
        console.log(res);
        types = res.types;

        var endpoint = {};
        
        if (res.endpoint) {
            endpoint = res.endpoint;
        }

        var type_field = new MinovalTypeField(endpoint.mino_type, page.element);

        // type_field.form.val(res.endpoint);

    	page.element.append(
            type_field.element,
            page.submit = $("<button />").text("Submit"),
    		output = $("<pre />")
    	)

        page.submit.click(function() {
            type_field.form.submit();
        })

        console.log(window.location.href, query_string);
        console.log('\n\n', type_field.base_fields, '\n\n');

        type_field.form.on_submit(function(object) {
            // var object = type_field.val();
            console.log(object);
            output.text('"object": '+JSON.stringify(object,null,4));

            endpoint.mino_type = object;

			var path = location.pathname.split('/');
			var url = minoval_path + 'save_endpoint';

			$.ajax({
		        type: "POST",
		        url: url,
		        contentType: "application/json; charset=utf-8",
		        dataType: "json",
		        data: JSON.stringify(endpoint),
		        success: function(response) {
                    type_field.form.clear_errors();
		            SAFE.load_url(SAFE.path, true);
                    console.log(response);
		        },
		        error: function(err, response) {
		        	console.log(err.responseJSON, response);
                    type_field.form.error(err.responseJSON)
		        }
		    })
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