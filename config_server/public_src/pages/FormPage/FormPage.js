SAFE.extend(FormPage, Page);

function FormPage(req) {
    var page = this;

    page.name = req.params.name;
    console.log(page.name);

    FormPage.superConstructor.call(this);
    
    header.element.text("Example form");

    page.element.addClass("form_page");

    page.fetch_data();
}

FormPage.prototype.fetch_data = function() {
    var page = this;
    console.log("FETCHING", page.name);
    minoval.get_rule(page.name, function(err, vr) {
        
        var form = vr.create_form();

        console.log(form);

        page.element.append(
            form.element,
            submit = $("<button />").text("Submit"),
            output = $("<pre />")
        )

        submit.click(function() {
            form.submit();
        });

        form.on_submit(function(object){
            console.log('FORM OBJECT', object);

            vr.validate(object, function(error) {
                if(error){
                    console.log(error);
                    form.error(error)
                    output.text('"error": '+JSON.stringify(error,null,4));
                } else {
                    form.clear_errors();
                    output.text('"object": '+JSON.stringify(object,null,4));
                }
            });
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