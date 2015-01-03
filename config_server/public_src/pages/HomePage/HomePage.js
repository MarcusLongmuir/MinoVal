SAFE.extend(HomePage, Page);

function HomePage(req) {
    var page = this;

    HomePage.superConstructor.call(this);

    page.table = $("<table/>")

    header.element.text("Minoval rules");

    page.element.addClass("home_page").append(
      page.table,
      $("<a/>").text("Create new").attr("href", minoval_path + "types").ajax_url()
    )

    page.fetch_data();

}

HomePage.prototype.fetch_data = function() {
    var page = this;
    console.log("fetching");
    $.post(minoval_path + 'get_rules', function(res) {
        console.log(res);
        page.table.empty();
        var objects = res.objects;
        
        if (objects === undefined) {
            return;
        }

        for (var i=0; i<objects.length; i++) {
            var object = objects[i];
            var name = object.name;

            var tr = $("<tr/>");
            page.table.append(tr);

            tr.append(
                $("<td/>").append(
                    $("<div/>").text(name)
                ),
                $("<td/>").append(
                    $("<a/>").text("Edit").attr("href", minoval_path + "types/?name="+name).ajax_url()
                ),
                $("<td/>").append(
                    $("<a/>").text("Delete").attr("href", "#").attr("rule_name", name).click(function() {
                        var name = $(this).attr("rule_name");
                        page.delete_rule(name);
                    })
                )
            );

            tr.append(
                $("<td/>").append(
                    $("<a/>").text("Example form").attr("href", minoval_path + "form/"+name)
                )
            )
        }
    });
}

HomePage.prototype.delete_rule = function(name) {
    var page = this;

    $.post(minoval_path + "delete_rule", {name: name}, function(res) {
        page.fetch_data();
    });
}

HomePage.prototype.get_title = function() {
    var page = this;
    return null;
}

HomePage.prototype.init = function() {
    var page = this;

}

HomePage.prototype.remove = function() {
    var page = this;

}

HomePage.prototype.resize = function(resize_obj) {
    var page = this;
}