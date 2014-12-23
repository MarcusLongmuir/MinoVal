var gulp = require('gulp');
var gutil = require('gulp-util');
var logger = require('tracer').console();

var nodemon = require('gulp-nodemon');
var path = require('path');

var plumber = require('gulp-plumber');

var less = require('gulp-less');
var concat = require('gulp-concat');
var gulpImports = require('gulp-imports');

var onError = function (err) {  
    gutil.beep();
    console.log(err);
};

gulp.task('less', function(){

    var setup_less_compilation = function(folder_name) {
        gulp.src('./'+ folder_name + '/public_src/style/style.less')
        .pipe(plumber(onError))
        .pipe(less())
        .pipe(concat('style.css'))
        .pipe(gulp.dest('./' + folder_name + '/public/'));    
    }

    setup_less_compilation('config_server');
    setup_less_compilation('example_server');
    
});

gulp.task('js', function(){

    var setup_js_compilation = function(folder_name) {
        gulp.src([
            folder_name + '/public_src/init.js'
        ])
        .pipe(plumber(onError))
        .pipe(gulpImports())
        .pipe(concat('frontend.js'))
        .pipe(gulp.dest('./' + folder_name + '/public/'))
    }

    setup_js_compilation('config_server');
    setup_js_compilation('example_server');

    gulp.src([
        'public_src/minoval.js'
    ])
    .pipe(plumber(onError))
    .pipe(gulpImports())
    .pipe(concat('minoval.js'))
    .pipe(gulp.dest('public/'))

});

gulp.task('watch', function(){

    var setup_watcher = function(folder_name) {
        gulp.watch([folder_name + '/public_src/**/*.js'], ['js']);
        gulp.watch([folder_name + '/public_src/**/*.less', folder_name + '/public_src/**/*.subless'], ['less']);    
    }

    setup_watcher('config_server');
    setup_watcher('example_server');
    gulp.watch(['common/**/*.js'], ['js']);
    gulp.watch(['public_src/**/*.js'], ['js']);

});

gulp.task('nodemon', function () {
    nodemon({ script: 'server.js', watch: [
        'minoval.js',
        'errors.js',
        'config_server/ConfigServer.js',
        'common/',
        'node_modules/minodb/'
    ], ext: 'js', ignore: ['node_modules/'] })
        .on('restart', function () {
            console.log('restarted!')
        })
})

gulp.task('default', function(){
    gulp.start('nodemon');
})