@import("../bower_components/jquery/dist/jquery.js");
@import("../bower_components/safe/safe.js");
@import("../bower_components/fieldval/fieldval.js");
@import("../bower_components/fieldval-basicval/fieldval-basicval.js");
@import("../bower_components/fieldval-rules/fieldval-rules.js");
@import("../bower_components/fieldval-ui/fieldval-ui.js");
@import("../bower_components/fieldval-dateval/fieldval-dateval.js");
@import("../bower_components/fieldval-ui/themes/minimal.js");
@import("pages/pages.js");
@import("common_elements/common_elements.js");


var page_title_append = "MinoVal";

var header = new Header();

$(document).ready(function(){

	// This callback is called before the current page's resize function is called. Use this callback to resize elements other than the page and set values that pages could make use of.
	SAFE.on_resize = function(resize_obj){

		//Add properties based on the dimensions of the window
		resize_obj.large_screen = resize_obj.window_width > 700;

	}

	header.element.appendTo("body");

	// Append the framework's body_contents element somewhere. This element will contain the page.
    var page_holder = SAFE.element.addClass("page_holder").appendTo("body");

	SAFE.transition_page = function(new_page,old_page){
		var title = new_page.get_title();
		if(title==null){
			document.title = page_title_append;
		} else {
			document.title = new_page.get_title() + " - " + page_title_append;
		}
	}

	//Set the 404 page class
	SAFE.set_404(NotFoundPage);

	SAFE.path = minoval_path;

	// SAFE.init loads the page for the current url.
	SAFE.init();
});