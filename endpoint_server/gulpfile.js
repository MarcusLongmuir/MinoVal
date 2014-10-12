var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');

var less = require('gulp-less');
var concat = require('gulp-concat');
var gulpImports = require('gulp-imports');
var nodemon = require('gulp-nodemon');

var onError = function (err) {  
  gutil.beep();
  console.log(err);
};

gulp.task('less', function(){
    gulp.src('./public_src/style/style.less')
    .pipe(plumber(onError))
    .pipe(less())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./public/'));
});

gulp.task('js', function(){
    return gulp.src([
        'public_src/init.js'
    ])
    .pipe(plumber(onError))
    .pipe(gulpImports())
    .pipe(concat('frontend.js'))
    .pipe(gulp.dest('./public/'))
});

gulp.task('watch', function(){
    gulp.watch(['public_src/**/*.js'], ['js']);
    gulp.watch(['public_src/**/*.less','public_src/**/*.subless'], ['less']);
});

gulp.task('default', function(){
    gulp.start('js');
    gulp.start('less');
})

gulp.task('nodemon', function () {
    nodemon({ script: 'server/server.js', watch: 'server/', ext: 'js', ignore: ['public_src/','public/'] })
    .on('restart', function () {
        console.log('restarted!')
    })
})

gulp.task('dev', function(){
    gulp.start('default');
    gulp.start('nodemon');
    gulp.start('watch');
})