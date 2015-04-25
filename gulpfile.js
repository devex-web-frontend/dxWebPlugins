var gulp = require('gulp'),
	babel = require('gulp-babel'),
	watch = require('gulp-watch'),
	rename = require('gulp-rename');

gulp.task('default', function() {
	gulp.src('./src/**/*.js')
		.pipe(watch('./src/**/*.js', {verbose: true}))
		.pipe(babel(), {verbose: true})
		.pipe(rename(function(path) {
			path.dirname = '.';
		}))
		.pipe(gulp.dest('dist'));

	 //watch('./src/**/*.js', function() {

	//})
});
