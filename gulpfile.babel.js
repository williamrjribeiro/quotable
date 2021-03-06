/* @flow */
import gulp from 'gulp';
import shell from 'gulp-shell';
import watch from 'gulp-watch';
import gls from 'gulp-live-server';
import rimraf from 'rimraf';
import run from 'run-sequence';
import browserify from 'browserify';
import vinylSourceStream from 'vinyl-source-stream';
import vinylBuffer from 'vinyl-buffer';
import loadPlugins from 'gulp-load-plugins';

const plugins = loadPlugins();

const PATHS = {
    server: {
        dist:   './dist',
        src:    './server',
        main:   './dist/index.js'
    },
    client: {
        dist:   './public',
        src:    './client',
        main:   './client/app.js'
    },
    crossenv: {
        src:    './crossenv'
    },
    js:     '/**/*.js',
    json:   '/**/*.json',
    html:   '/**/*.html',
    css:    '/**/*.css',
    all:    '/**/*.*'
};

gulp.task('default', done => {
    run('clean',['build-server','transpile'],['copy-client','copy-bootstrap'],'start-server','watch', done);
});

gulp.task('build-server', done => {
    run('flow', 'babel', done);
});

gulp.task('transpile', () => {
    return browserify({
            entries: PATHS.client.main,
            debug: true
        })
        .transform("babelify")
        .bundle()
        .pipe(vinylSourceStream("bundle.js"))
        .pipe(vinylBuffer())
        .pipe(plugins.sourcemaps.init({
			loadMaps: true // Load the sourcemaps browserify already generated
		}))
        .pipe(plugins.ngAnnotate())
        .pipe(plugins.sourcemaps.write("./", {
			includeContent: true
		}))
        .pipe(gulp.dest(PATHS.client.dist))
        .on("error", function (error) {
            console.error( `\n[transpile.transpile] Error: ${error.message}\n`);
            this.emit("end");
        });
});

gulp.task('copy-client', () => {
    gulp.src(PATHS.client.src + PATHS.html).pipe(gulp.dest(PATHS.client.dist));
    gulp.src(PATHS.client.src + PATHS.css).pipe(gulp.dest(PATHS.client.dist));
    //gulp.src(PATHS.client.src + PATHS.json).pipe(gulp.dest(PATHS.client.dist));
});

gulp.task('copy-bootstrap', () => {
    gulp.src("node_modules/bootstrap/dist/**/*").pipe(gulp.dest(PATHS.client.dist+"/bootstrap"));
});

gulp.task('clean', done => {
    run(['clean-server','clean-client'], done);
});

gulp.task('clean-server', done => {
    rimraf(PATHS.server.dist, done);
});

gulp.task('clean-client', done => {
    rimraf(PATHS.client.dist, done);
});

gulp.task('flow', shell.task([
    'flow'
], {ignoreErrors: true}));

gulp.task('babel', shell.task([
    'babel server --out-dir dist'
    //`babel ${PATHS.server.src} --out-dir ${PATHS.server.dist}`
    ], {ignoreErrors: true}));

let express;

gulp.task('start-server', (done) => {
    if(express)
        express.stop();
    express = gls.new(PATHS.server.main, 3000);

    //use gulp.watch to trigger server actions(notify, start or stop)
    watch([PATHS.client.dist + PATHS.all], (file) => {
        console.log("[gulp.start-server.watch] A STATIC CLIENT file has changed! file:", file.relative);
        express.notify.apply(express, [file]);
    });

    run('restart-server', done);
});

gulp.task('restart-server', () => {
    if(express){
        express.start.bind(express)();
    }
});

gulp.task('watch', () => {
    watch(PATHS.server.src + PATHS.js, () => {
        console.log("[gulp.watch] SERVER files changed! building server...");
        run('build-server','start-server');
    });
    watch(PATHS.client.src + PATHS.all, (file) => {
        console.log("[gulp.watch] CLIENT JS file changed! transpiling..., file:",file.relative);
        run('transpile');
    });
    function copyClientStaticFiles(file) {
        console.log("[gulp.watch] CLIENT STATIC file changed! copying..., file:",file.relative);
        run(['copy-client','copy-bootstrap']);
    }
    watch(PATHS.client.src + PATHS.html, copyClientStaticFiles);
    watch(PATHS.client.src + PATHS.css, copyClientStaticFiles);
    watch(PATHS.crossenv.src + PATHS.js, (file) => {
        console.log("[gulp.watch] CROSSENV JS file changed! transpiling..., file:",file.relative);
        run('transpile');
    });
});
