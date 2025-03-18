import gulp from 'gulp';
import plumber from 'gulp-plumber';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import fileInclude from 'gulp-file-include';
import browserSync from 'browser-sync';
import svgSprite from 'gulp-svg-sprite';
import cheerio from 'gulp-cheerio';
import replace from 'gulp-replace';
import webp from 'gulp-webp';
import {deleteAsync} from 'del';

import uglify from 'gulp-uglify';
import webpack from 'webpack-stream';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import rename from 'gulp-rename';

const PROJECT_FOLDER = '.';
const SRC_FOLDER = '.';
const PUBLICATION_FOLDER = './build';
const SERVER_FOLDER = './';

const Path = {
  SRC: {
    html: `${SRC_FOLDER}/html/*.html`,
    scss: `${SRC_FOLDER}/style/resource/*.scss`,
    js: `${SRC_FOLDER}/js/resource/*.js`,
    img: `${SRC_FOLDER}/i/media-resource/**/*.{jpg,png,svg}`,
    sprite: `${SRC_FOLDER}/i/icons/**/*.svg`,
    assets: `${SRC_FOLDER}/i/media-resource/**/*.{jpg,png,svg}`,
    json: `${SRC_FOLDER}/json/**/*.json`,
  },
  BUILD: {
    html: `${PROJECT_FOLDER}/`,
    css: `${PROJECT_FOLDER}/style/modules/`,
    js: `${PROJECT_FOLDER}/js/modules/`,
    img: `${PROJECT_FOLDER}/i/media/`,
    sprite: `${PROJECT_FOLDER}/i/media`,
    assets: `${PROJECT_FOLDER}/i/media`,
  },
  PUBLICATION: {
    html: `${PUBLICATION_FOLDER}/`,
    css: `${PUBLICATION_FOLDER}/style/modules/`,
    js: `${PUBLICATION_FOLDER}/js/modules/`,
    img: `${PUBLICATION_FOLDER}/i/media/`,
    sprite: `${PUBLICATION_FOLDER}/i/media/`,
    assets: `${PUBLICATION_FOLDER}/i/media`,
  },
  WATCH: {
    html: `${SRC_FOLDER}/html/**/*.html`,
    scss: `${SRC_FOLDER}/style/resource/**/*.scss`,
    js: `${SRC_FOLDER}/js/resource/**/*.js`,
    json: `${SRC_FOLDER}/json/**/*.{json}`,
    sprite: `${SRC_FOLDER}/i/icons/**/*.svg`,
    assets: `${SRC_FOLDER}/i/media-resource/**/*.{jpg,png,svg}`,
  },
  CLEAN: ['./*.html', `${PROJECT_FOLDER}/i/media`, `${PROJECT_FOLDER}/js/modules/`, `${PROJECT_FOLDER}/style/modules/`]
};

const sass = gulpSass(dartSass);
const browser = browserSync.create();

let isDevelopment = true;

function createHtml() {
  return gulp
    .src(Path.SRC.html)
    .pipe(
      fileInclude({
        prefix: '@@',

        context: {
          path: '/',
        },
      })
    )
    .pipe(gulp.dest(Path.BUILD.html))
    .pipe(browser.stream());
}

function createStyles() {
  return gulp
    .src(Path.SRC.scss, { sourcemaps: isDevelopment })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(
      fileInclude({
        prefix: '@@',

        context: {
          path: '/',
        },
      })
    )
    .pipe(gulp.dest(Path.BUILD.css))
    .pipe(browser.stream());
}

function createSprite() {
  return gulp
    .src(Path.SRC.sprite)
    .pipe(plumber())
    .pipe(
      cheerio({
        run: ($) => {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: { xmlMode: true },
      })
    )
    .pipe(replace('&gt;', '>'))
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: '../sprite.svg',
          },
        },
      })
    )
    .pipe(gulp.dest(Path.BUILD.sprite));
}

function copyAssets() {
  return gulp.src(Path.SRC.assets, { base: 'i/media-resource' }).pipe(gulp.dest(Path.BUILD.assets));
}

function createWebp() {
  return gulp
    .src(Path.SRC.img)
    .pipe(webp({ quality: 80 }))
    .pipe(gulp.dest(Path.BUILD.img));
}

function optimizeImages() {
  return gulp
    .src(Path.SRC.img)
    .pipe(
      imagemin([
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: false }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(gulp.dest(Path.BUILD.img));
}

function serve(done) {
  browser.init({
    server: {
      baseDir: SERVER_FOLDER,
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

function reload(done) {
  browser.reload();
  done();
}

function clean() {
  return deleteAsync(Path.CLEAN);
}

function watch() {
  gulp.watch(Path.WATCH.scss, gulp.series(createStyles, reload));
  gulp.watch(Path.WATCH.sprite, gulp.series(createSprite, reload));
  gulp.watch(Path.WATCH.assets, gulp.series(copyAssets, reload));
  gulp.watch(Path.SRC.img, gulp.series(createWebp));
  // gulp.watch(path.watch.json, gulp.series(reloadServer));
  // gulp.watch(Path.WATCH.js, gulp.series(scripts, reload));
  gulp.watch(Path.WATCH.html, gulp.series(createHtml, reload));
}

function compileProject(done) {
  gulp.parallel(createHtml, createStyles, copyAssets, createSprite)(done);
}

export function runDev(done) {
  gulp.series(
    clean,
    compileProject,
    serve,
    watch
  )(done);
}
