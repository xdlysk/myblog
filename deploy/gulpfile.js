'use strict';
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const uglifycss = require('gulp-uglifycss');

gulp.task('compressjs',()=>{
    return gulp.src('../public/javascripts/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('public/javascripts'));
});

gulp.task('compresscss',()=>{
    return gulp.src('../public/stylesheets/**/*.css')
    .pipe(uglifycss())
    .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('default',['compressjs','compresscss'],()=>{
    console.log('task over');
})