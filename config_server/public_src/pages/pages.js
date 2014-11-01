@import("HomePage/HomePage.js");
@import("TypesPage/TypesPage.js");
@import("FormPage/FormPage.js");
@import("NotFoundPage/NotFoundPage.js");


SAFE.add_url('/', HomePage);
SAFE.add_url('/types', TypesPage);
SAFE.add_url("/form/:name", FormPage);