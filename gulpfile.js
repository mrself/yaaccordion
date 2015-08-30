var gulp = require('gulp'),
	sass = require('gulp-sass'),
	notify = require('gulp-notify'),
	include = require('gulp-include'),
	watch = require('gulp-watch'),
	uglify = require('gulp-uglify'),
	jshint = require('gulp-jshint'),
	rename = require('gulp-rename');

var src = './src/';
var build = './build/';

var config = {
	src: {
		js: src + 'js/**/*.js',
		css: src + 'sass/**/*.scss'
	},
	build: {
		js: build,
		css: build + 'main.scss'
	},
	sassSettings: {
		style: 'compressed',
		errLogToConsole: true
	}
};

gulp.task('js', function() {
	return gulp.src(src + 'js/main.js')
		.pipe(jshint())
		.pipe(gulp.dest(build));
});

gulp.task('css', function() {
	return gulp.src(src + 'sass/main.scss')
		.pipe(sass(config.sassSettings))
		.pipe(gulp.dest(build));
});

gulp.task('watch', function() {
	watch(config.src.js, function() {
		gulp.start('js');
	});
	watch(config.src.css, function() {
		gulp.start('css');
	});
});

gulp.task('default', ['js', 'css', 'watch']);