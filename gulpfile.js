var gulp = require('gulp'),
	babel = require('gulp-babel'),
	watch = require('gulp-watch'),
	rename = require('gulp-rename'),
    jsdoc = require("gulp-jsdoc");



gulp.task('default', function() {
	gulp.src('./src/**/*.js')
		.pipe(watch('./src/**/*.js', {verbose: true}))
		.pipe(babel(), {verbose: true})
		.pipe(rename(function(path) {
			path.dirname = path.dirname.replace('src', '.');
		}))
		.pipe(gulp.dest('dist'));
});


gulp.task("jsdoc", function() {
    gulp.src("./test/in/*.js")
        .pipe(jsdoc('./test/out/api'))
});