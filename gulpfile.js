import gulp from 'gulp';
import plumber from 'gulp-plumber';
import * as dartSass from 'sass';
import webpack from 'webpack-stream';
import gulpSass from 'gulp-sass';
import uglify from 'gulp-uglify';
import fileInclude from 'gulp-file-include';
import browserSync from "browser-sync";
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
    img: `${SRC_FOLDER}/i/media-resource/**/*.{jpg,png}`,
    sprite: `${SRC_FOLDER}/i/media-resource/icons/**/*.svg`,
    assets: `${SRC_FOLDER}/i/media-resource/**/*`,
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
    css: `${SRC_FOLDER}/style/resource/**/*.scss`,
    js: `${SRC_FOLDER}/js/resource/**/*.js`,
    json: `${SRC_FOLDER}/json/**/*.{json}`,
    assets: `${SRC_FOLDER}/i/media-resource/**/*.{jpg,png}`,
  },
};

const sass = gulpSass(dartSass);
const browser = browserSync.create();

let isDevelopment = true;

export function html() {
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

export function styles() {
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


export function serve(done) {
  browser.init({
    server: {
      baseDir: SERVER_FOLDER
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

function watch() {
  gulp.watch(Path.WATCH.css, gulp.series(styles, reload));
  // gulp.watch(path.watch.assets, gulp.series(copyAssets, createWebp));
  // gulp.watch(path.watch.json, gulp.series(reloadServer));
  // gulp.watch(Path.WATCH.js, gulp.series(scripts, reload));
  gulp.watch(Path.WATCH.html, gulp.series(html, reload));
}

function compileProject(done) {
  gulp.parallel(
    html,
    styles,
    // scripts,
    // copyAssets,
    // createStack,
    // createWebp
  )(done);
}

export function runDev(done) {
  gulp.series(
    // deleteFolders,
    compileProject,
    serve,
    watch
  )(done);
}
