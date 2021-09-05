var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var postcss = require('gulp-postcss');
var browserSync = require('browser-sync').create();
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var sourcemaps = require('gulp-sourcemaps');
var imagein = require('gulp-imagemin');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');
var ghPages = require('gulp-gh-pages');
var fs = require('fs');

const paths = {
  css: {
    assets: 'app/assets/scss/*.scss',
    dest: 'app/dist/styles',
  },
  js: {
    assets: 'app/assets/js/*.js',
    dest: 'app/dist/js',
  },
  index:{
    assets:'app/assets/*.+(html|njk)',
    dest:'app/dist'
  },
  pages: {
    assets: 'app/assets/pages/*.+(html|njk)',
    dest: 'app/dist'
  },
  layout:{
    templates: 'app/assets/templates',
    icons: 'app/assets/images'
  },
  images: {
    assets: 'app/assets/images/**/*{.png,.jpg,.svg}',
    dest: 'app/dist/images',
  },
  deploy:{
    public:'app/dist/**/*'
  }
};

const config ={
  top_page:"",
  image_directory:"images/",
  css_directory:"styles/",
  pages:""
};


function styles() {
  return gulp
    .src(paths.css.assets)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.css.dest))
    .pipe(browserSync.stream());
}

function scripts() {
  return gulp
    .src(paths.js.assets)
    .pipe(gulp.dest(paths.js.dest))
    .pipe(browserSync.stream());
}

function index() {
  return gulp
    .src(paths.index.assets)
    .pipe(data(function (){
      return config;
    }))
    .pipe(
      nunjucksRender({
        path: [paths.layout.templates,paths.layout.icons],
        ext: '.html',
      })
    )
    .pipe(gulp.dest(paths.index.dest))
    .pipe(browserSync.stream());
}

function pages() {
  return gulp
    .src(paths.pages.assets)
    .pipe(data(function (){
      return config;
    }))
    .pipe(
      nunjucksRender({
        path: [paths.layout.templates,],
        ext: '.html',
      })
    )
    .pipe(gulp.dest(paths.pages.dest))
    .pipe(browserSync.stream());
}

function images() {
  return gulp
    .src(paths.images.assets)
    .pipe(imagein())
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream());
}

function watch() {
  browserSync.init({
    server: {
      baseDir: './app/dist',
    },
  });
  gulp.watch(paths.css.assets, styles);
  gulp.watch(paths.js.assets, scripts);
  // gulp.watch(paths.index.assets).on('change', browserSync.reload);
  // gulp.watch(paths.pages.assets,pages);
  gulp.watch(paths.index.assets).on('change', browserSync.reload);
  gulp.watch(paths.pages.assets).on('change', browserSync.reload);
  gulp.watch(paths.images.assets, images);
}
function deploy(){
  return gulp
    .src(paths.deploy.public)
    .pipe(ghPages());
}
exports.watch = watch;
exports.deploy = deploy;


//Create default tasks
var build = gulp.parallel(styles, scripts, pages,index,  images, watch);
gulp.task('default', build);
