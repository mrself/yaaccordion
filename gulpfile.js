var gulp = require('gulp'),
	sass = require('gulp-sass'),
	notify = require('gulp-notify'),
	include = require('gulp-include'),
	watch = require('gulp-watch'),
	uglify = require('gulp-uglify'),
	jshint = require('gulp-jshint'),
	rename = require('gulp-rename'),
	browserSync = require('browser-sync'),
	source = require('vinyl-source-stream'),
	watchify = require('watchify'),
	browserify = require('browserify'),
	bundleLogger = require('./gulp-utils/bundleLogger');

var src = './src/';
var build = './tests/';

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


var outputFile = 'app.js';
gulp.task('watchify', function() {
	var bundler = browserify({
			cache: {}, packageCache: {}, fullPaths: false,
			entries: './src/js/main.js',
			dest: './tests/' + outputFile
		}),
		watcher = watchify(bundler),
		bundle = function() {
			bundleLogger.start(outputFile);
			return watcher
				.bundle()
				.pipe(source(outputFile))
				.pipe(gulp.dest('./tests'))
				.on('end', function() {
					bundleLogger.end(outputFile);
					// setTimeout(browserSync.reload, 1500);
				});
		};

	watcher.on('update', bundle);
	bundleLogger.watch(outputFile);
	return bundle();

});
gulp.task('browser-sync', function() {
	browserSync.init({
		server: {
			baseDir: './tests'
		},
		files: ['tests/**/*']
	});
});


gulp.task('css', function() {
	return gulp.src(src + 'sass/main.scss')
		.pipe(sass(config.sassSettings))
		.pipe(gulp.dest(build));
});

gulp.task('watch', function() {
	watch(config.src.css, function() {
		gulp.start('css');
	});
});

gulp.task('default', ['watchify', 'css', 'watch', 'browser-sync']);