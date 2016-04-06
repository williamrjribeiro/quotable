import gulp from 'gulp';
import shell from 'gulp-shell';
import rimraf from 'rimraf';
import run from 'run-sequence';
import watch from 'gulp-watch';
import server from 'gulp-live-server';
import browserify from 'browserify';
import source from "vinyl-source-stream";

const PATHS = {
    server: {
        dist:   './dist',
        src:    './server',
        main:   './server/index.js'
    },
    client: {
        dist:   './public',
        src:    './client',
        main:   './client/js/app.js'
    },
    js: '/**/*.js',
    html: '/**/*.html'
};

gulp.task('default', done => {
    //run('server', 'build', 'watch', done);
    run('clean',['build-server','transpile'],'copy-client','restart','watch', done);
});

gulp.task('build-server', done => {
    run('flow', 'babel', 'server', done);
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

gulp.task('server', () => {
    express = server.new(PATHS.server.dist);
});

gulp.task('restart', () => {
    if(express)
        express.start.bind(express)();
    else {
        console.log("[gulp.restart] Express server don't exist. Continue...");
    }
});

gulp.task('watch', () => {
    watch(PATHS.server.src + PATHS.js, () => {
        gulp.start('build');
    });
    watch(PATHS.client.src + PATHS.js, () => {
        gulp.start('transpile');
    });
});
