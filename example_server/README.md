This example demonstrates the functionality and conventional project structure of a SAFE-powered site.

This example uses gulp-imports to allow inline imports of javascript files using the following syntax:

@import("/path/to/other/file.js");


To run the project:

npm install
bower install
gulp dev


This will run the server using nodemon - which will restart upon changes to .js files in the "server" directory and also use "gulp-watch" to watch the "public_src" directory for changes to .js and .subless/.less files to trigger rebuilds of Javascript and CSS.