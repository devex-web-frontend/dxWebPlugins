var gulp = require('gulp'),
	babel = require('gulp-babel'),
	watch = require('gulp-watch'),
	rename = require('gulp-rename'),
    gCrashSound = require('gulp-crash-sound');


gCrashSound.config({
    file: './gulpCrashSound.mp3'
});

gulp.task('default', function() {
	gulp.src('./src/**/*.js')
		.pipe(watch('./src/**/*.js', {verbose: true}))
		.pipe(babel(), {verbose: true})
		.pipe(rename(function(path) {
			path.dirname = path.dirname.replace('src', '.');
		}))
		.pipe(gulp.dest('dist'));
});