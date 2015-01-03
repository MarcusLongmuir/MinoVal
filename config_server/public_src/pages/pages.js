@import("HomePage/HomePage.js");
@import("RulePage/RulePage.js");
@import("FormPage/FormPage.js");
@import("NotFoundPage/NotFoundPage.js");


SAFE.add_url('/', HomePage);
SAFE.add_url('/types', RulePage);
SAFE.add_url("/form/:name", FormPage);