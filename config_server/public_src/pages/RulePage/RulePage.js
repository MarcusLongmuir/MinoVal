SAFE.extend(RulePage, Page);

function RulePage(req) {
    var page = this;

    RulePage.superConstructor.call(this);

    header.element.text("Create/Edit rule");

    page.table = $("<table/>")

    page.fetch_data();

}

RulePage.prototype.create_type_field = function(rule) {
    var page = this;
    if (rule == undefined) {
        rule = {}
    }

    page.type_field = new MinovalTypeField(rule.mino_type, page.element, page.types);

    page.element.append(
        page.type_field.element,
        page.submit = $("<button />").text("Submit"),
        output = $("<pre />")
    )

    page.submit.click(function() {
        page.type_field.form.submit();
    })

    page.type_field.form.on_submit(function(object) {
        // var object = type_field.val();
        console.log(object);
        output.text('"object": '+JSON.stringify(object,null,4));

        rule.mino_type = object;

        var url = minoval_path + 'save_rule';

        $.ajax({
            type: "POST",
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(rule),
            success: function(response) {
                page.type_field.form.clear_errors();
                SAFE.load_url(SAFE.path, true);
                console.log(response);
            },
            error: function(err, response) {
                console.log(err.responseJSON, response);
                page.type_field.form.error(err.responseJSON)
            }
        })
    })

}

RulePage.prototype.fetch_data = function() {
    var page = this;
    var query_string = get_query_params();

    $.post(minoval_path + 'get_types', {name: query_string.name}, function(res) {
        console.log(res);
        page.types = res.types;

        var rule = {};
        if (res.rule) {
            rule = res.rule;
        }
        page.create_type_field(rule);
    });
}

RulePage.prototype.get_title = function() {
    var page = this;
    return null;
}

RulePage.prototype.init = function() {
    var page = this;

}

RulePage.prototype.remove = function() {
    var page = this;

}

RulePage.prototype.resize = function(resize_obj) {
    var page = this;
}