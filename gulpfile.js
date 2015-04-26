var gulp = require('gulp'),
	babel = require('gulp-babel'),
	watch = require('gulp-watch'),
	rename = require('gulp-rename'),
    gCrashSound = require('gulp-crash-sound'),
    gulpJsdoc2md = require("gulp-jsdoc-to-markdown"),
    jsdoc = require("gulp-jsdoc");

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

gulp.task("docs", function() {
    return gulp.src("code/*.js")
        .pipe(gulpJsdoc2md())
        .on("error", function(err){
            gutil.log("jsdoc2md failed:", err.message);
        })
        .pipe(rename(function(path){
            path.extname = ".md";
        }))
        .pipe(gulp.dest("./api/"))
});


gulp.task("jsdoc", function() {
    gulp.src("./code/*.js")
        .pipe(jsdoc.generator('./api'))
});