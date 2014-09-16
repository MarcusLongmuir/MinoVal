var gulp = require('gulp');
var logger = require('tracer').console();

var nodemon = require('gulp-nodemon');
var path = require('path');

var onError = function (err) {  
  gutil.beep();
  console.log(err);
};

gulp.task('nodemon', function () {
  nodemon({ script: 'server.js', watch: [
  	'server.js',
  	'node_modules/minodb/api/'
  ], ext: 'js', ignore: ['node_modules/'] })
    .on('restart', function () {
      console.log('restarted!')
    })
})

gulp.task('default', function(){
    gulp.start('nodemon');
})