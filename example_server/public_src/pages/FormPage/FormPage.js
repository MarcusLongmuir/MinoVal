SAFE.extend(FormPage, Page);

function FormPage(req) {
    var page = this;

    page.name = req.params.name;

    FormPage.superConstructor.call(this);
    
    header.element.text("Example form");

    page.element.addClass("form_page");

    page.fetch_data();
}

FormPage.prototype.fetch_data = function() {
    var page = this;
    $.post(minoval_path + 'get_endpoint', {name: page.name}, function(type_object) {
        if (type_object === null) {
            var message = $("<p/>").text("Form doesn't exist");
            $("body").append(message);
            return;
        }

        var vr = new ValidationRule();
        var rule_error = vr.init(type_object);
        if(rule_error){
            console.error(rule_error);
            return;
        }

        var form = vr.create_form();

        form.val({
            user: {
                id: 123,
                first_name: 123,
                last_name: 123,
                Address: 123,
                company_id: 123
            },
        })

        page.element.append(
            form.element.append(
                $("<button />").text("Submit")
            ),
            output = $("<pre />")
        )

        form.on_submit(function(object){

            var error = vr.validate(object);
          
            if(error){
                console.log(error);
                form.error(error)
                output.text('"error": '+JSON.stringify(error,null,4));
            } else {
                form.clear_errors();
                output.text('"object": '+JSON.stringify(object,null,4));

                var path = location.pathname.split('/');
                var url = minoval_path + 'endpoint/' + path[path.length-1];

                $.ajax({
                    type: "POST",
                    url: url,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(object),
                    success: function(response) {
                        console.log(response);
                    },
                    error: function(err, response) {
                        console.log(err, response);
                    }
                })
            }
        })
    });
}

FormPage.prototype.get_title = function() {
    var page = this;
    return page.my_param;
}

FormPage.prototype.init = function() {
    var page = this;
}

FormPage.prototype.remove = function() {
    var page = this;
}

FormPage.prototype.resize = function(resize_obj) {
    var page = this;
}