import gulp from 'gulp';
import shell from 'gulp-shell';
import rimraf from 'rimraf';
import run from 'run-sequence';
import watch from 'gulp-watch';
import server from 'gulp-live-server';

const PATHS = {
    js: ['./server/**/*.js'],
    destination: './dist'
};

gulp.task('default', done => {
    run('server', 'build', 'watch', done);
});

gulp.task('build', done => {
    run('clean', 'flow', 'babel', 'restart', done);
});

gulp.task('clean', done => {
    rimraf(PATHS.destination, done);
});

gulp.task('flow', shell.task([
    'flow'
], {ignoreErrors: true}));

gulp.task('babel', shell.task([
    'babel server --out-dir dist'
], {ignoreErrors: true}));

let express;

gulp.task('server', () => {
    express = server.new(PATHS.destination);
});

gulp.task('restart', () => {
    express.start.bind(express)();
});

gulp.task('watch', () => {
    return watch(PATHS.js, () => {
        gulp.start('build');
    });
});
