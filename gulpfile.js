var gulp = require('gulp');
var gutil = require('gulp-util');
var notifier = require('node-notifier');
var autoprefixer = require('gulp-autoprefixer');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var jade = require('gulp-jade');
var changed = require('gulp-changed');
var browserSync = require('browser-sync');
var gulpPrettyDiff = require("gulp-prettydiff");

// gulp "task" --theme "themename"
var theme_name = gutil.env.theme;
var jade_dir = 'theme/' + theme_name + '/jade/';
var pack_dir = 'theme/' + theme_name + '/package/';

// gulp "task" --theme "themename" --view
var viewer = (gutil.env.view  == true) ? 'index' : gutil.env.view;

var jadeOPT = {
    pretty : true,
    cache:false
};


// LESS COMPILER

gulp.task('less', function () {
    return gulp.src(pack_dir + 'assets/less/{main,plugin}.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .on('error', function (error) {
            console.error(gutil.colors.white.bgGreen(error.message));
            notifier.notify({
                title: 'Less compilation error',
                message: error.message
            });
            this.emit('end');
        })
        .pipe(autoprefixer({
            browsers: ['last 6 version']
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(pack_dir + '/assets/css/'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('less-format', function () {
    gulp.src(pack_dir + 'assets/less/**/*.less')
    .pipe(gulpPrettyDiff({
        lang: "LESS",
        langdefault:"LESS",
        objsort: "css",
        mode: "beautify"
    }))
    .pipe(gulp.dest(pack_dir + 'assets/less/'));
});


// JADE COMPILER

gulp.task('jade', function () {
    return gulp.src([jade_dir + '*.jade'])
        .pipe(changed(pack_dir, {
            extension: '.html'
        }))
        .pipe(jade(jadeOPT))
        .on('error', function (error) {
            console.error(gutil.colors.red(error.message));
            notifier.notify({
                title: 'Jade compilation error',
                message: error.message
            });
            this.emit('end');
        })
        .pipe(gulp.dest(pack_dir))
        .pipe(browserSync.stream({match: '**/*.html'}));
});


gulp.task('jade-all', function () {
    return gulp.src([jade_dir + '*.jade'])
        .pipe(jade(jadeOPT))
        .on('error', function (error) {
            console.error(gutil.colors.red(error.message));
            notifier.notify({
                title: 'Jade compilation error',
                message: error.message
            });
            this.emit('end');
        })
        .pipe(gulp.dest(pack_dir))
        .on('finish' , browserSync.reload);
});


gulp.task('jade-view', function () {
    return gulp.src([jade_dir + viewer + '.jade'])
        .pipe(jade(jadeOPT))
        .on('error', function (error) {
            console.error(gutil.colors.red(error.message));
            notifier.notify({
                title: 'Jade compilation error',
                message: error.message
            });
            this.emit('end');
        })
        .pipe(gulp.dest(pack_dir))
        .pipe(browserSync.stream({match: '**/*.html'}));
});

// MAIN TASK
// View only mode if --view

gulp.task('serve',['less' , gutil.env.view ? 'jade-view' : 'jade-all'], function () {

    //init browser sync server
    browserSync({
        notify: true,
        port: 9000,
        server: {
            baseDir: [pack_dir]
        },
        startPath : gutil.env.view ? '/' + viewer + '.html' : null
    });

    // reload item in complilation process , log changed file
    gulp.watch([
        pack_dir + 'assets/**/*',
        pack_dir + 'vendors/**/*.js',
        pack_dir + 'vendors/**/*.css',
        '!' + pack_dir + 'assets/css/**/*',
        '!' + pack_dir + 'assets/less/**/*'
    ]).on('change', browserSync.reload);

    // compilation when changed files
    gulp.watch(pack_dir + 'assets/less/**/*.less', ['less']);
    gulp.watch(jade_dir + '*.jade',['jade']);
    // i don't use module/**/*.jade because its slow down when you click save a module in mixin
    gulp.watch([jade_dir + 'module/*.jade', jade_dir + 'module/mixin/*.jade'],[gutil.env.view ? 'jade-view' : 'jade-all']);

});

// DEFAULT TASKS
gulp.task('default', ['serve']);