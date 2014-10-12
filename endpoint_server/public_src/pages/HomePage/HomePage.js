SAFE.extend(HomePage, Page);

function HomePage(req) {
    var page = this;

    HomePage.superConstructor.call(this);

    page.table = $("<table/>")

    header.element.text("Endpoints");

    page.element.addClass("home_page").append(
      page.table,
      $("<a/>").text("Create new").attr("href", minoval_path + "types").ajax_url()
    )

    page.fetch_data();

}

HomePage.prototype.fetch_data = function() {
    var page = this;
    $.post(minoval_path + 'get_endpoints', function(res) {
        console.log(res);
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
                    $("<a/>").text("Edit").attr("href", minoval_path + "endpoint/"+name)
                ),
                $("<td/>").append(
                    $("<a/>").text("Form").attr("href", minoval_path + "example/form/"+name)
                )
            );
        }
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