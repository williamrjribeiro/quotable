import gulp from 'gulp';
import shell from 'gulp-shell';
import watch from 'gulp-watch';
import gls from 'gulp-live-server';
import rimraf from 'rimraf';
import run from 'run-sequence';
import browserify from 'browserify';
import source from "vinyl-source-stream";

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
    js:     '/**/*.js',
    html:   '/**/*.html',
    all:    '/**/*.*'
};

gulp.task('default', done => {
    run('clean',['build-server','transpile'],'copy-client','watch', done);
});

gulp.task('build-server', done => {
    run('flow', 'babel','start-server', done);
});

gulp.task('transpile', () => {
    return browserify(PATHS.client.main)
        .transform("babelify")
        .bundle()
        .on("error", function (error) {
            console.error( `\n[gulp.transpile] Error: ${error.message}\n`);
            this.emit("end");
        })
        .pipe(source("bundle.js"))
        .pipe(gulp.dest(PATHS.client.dist));
});

gulp.task('copy-client', () => {
    gulp.src(PATHS.client.src + PATHS.html).pipe(gulp.dest(PATHS.client.dist));
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
        console.log("[gulp.start-server.watch] A STATIC CLIENT file has changed! file:", file);
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
        gulp.start('build-server');
    });
    watch(PATHS.client.src + PATHS.js, (file) => {
        console.log("[gulp.watch] CLIENT JS file changed! transpiling..., file:",file);
        run('transpile');
    });
    watch(PATHS.client.src + PATHS.html, (file) => {
        console.log("[gulp.watch] CLIENT HTML file changed! copying..., file:",file);
        run('copy-client');
    });
});
