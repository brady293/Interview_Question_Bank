//套件方法的引入
const { src, dest, watch, series, parallel } = require('gulp');

// html package
const fileinclude = require('gulp-file-include');
function includeHTML() {
    return src('src/*.html') // 來源
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        })) // fileinclude function
        .pipe(dest('./dist')); // 目的地
}
exports.html = includeHTML;

// js move
const babel = require('gulp-babel');
function moveJs() {
    return src('src/js/*.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest('dist/js'))
}

// php move
function movePhp() {
    return src('src/*.php').pipe(dest('dist'))
}

//img move
function moveImg() {
    return src('src/images/*.*').pipe(dest('dist/images'))
}

// 壓圖
const imagemin = require('gulp-imagemin');
function min_images() {
    return src('src/images/*.*')
        .pipe(imagemin([
            imagemin.mozjpeg({ quality: 80, progressive: true }) // 壓縮品質      quality越低 -> 壓縮越大 -> 品質越差 
        ]))
        .pipe(dest('dist/images'))
}
exports.mini_img = min_images

const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');

// sass ->css
function styleSass() {
    return src('./src/sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError)) // expanded, compressed
        .pipe(sourcemaps.write())
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(dest('./dist/css'));
}


//刪除舊檔案
const clean = require('gulp-clean');
function clear() {
    return src('dist', { read: false, allowEmpty: true }) //不去讀檔案結構，增加刪除效率  / allowEmpty : 允許刪除空的檔案
        .pipe(clean({ force: true })); //強制刪除檔案 
}

// 監看
function watchfile() {
    watch(['src/*.html', 'src/**/*.html'], includeHTML) // 監看html
    watch('src/js/*.js', moveJs) // 監看js
    watch(['src/images/*.*', 'src/images/**/*.*'], moveImg) // 監看img
    watch('src/productpages/*.*', moveProductPages) // 監看moveProductPages
    watch(['./src/sass/*.scss', './src/sass/**/*.scss'], styleSass) // 監看sass
}

// 瀏覽器同步
const browserSync = require('browser-sync');
const reload = browserSync.reload;
function browser(done) {
    browserSync.init({
        server: {
            baseDir: "./dist",
            index: "index.html"
        },
        port: 3000
    });
    watch(['src/*.php', 'src/**/*.php'], movePhp).on('change', reload) // 監看php
    watch(['src/*.html', 'src/**/*.html'], includeHTML).on('change', reload) // 監看html
    watch('src/js/*.js', moveJs).on('change', reload) // 監看js
    watch(['src/images/*.*', 'src/images/**/*.*'], moveImg).on('change', reload) // 監看 img
    watch(['./src/sass/*.scss', './src/sass/**/*.scss'], styleSass).on('change', reload) // 監看sass
    done();
}

// 監看
exports.w = series(parallel(movePhp, moveJs, moveImg, includeHTML, styleSass), watchfile)

//瀏覽器同步
exports.default = series(clear, parallel(movePhp, moveJs, includeHTML, styleSass, moveImg), browser)

//打包上線
exports.package = series(clear, parallel(movePhp, moveJs, includeHTML, styleSass, min_images))