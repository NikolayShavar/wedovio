const {src, dest, watch, parallel, series} = require ('gulp');     //основной плагин, serias щтвечает за последовательность. 
const sass = require('gulp-sass')(require('sass'));        //плагин для стилей
const concat = require('gulp-concat')                      //плагин для переименований и минификаций файлов, еще он вроде объединять умеет. 
const uglify = require('gulp-uglify-es').default;          // плагин для js 
const browserSync = require('browser-sync').create();      // живой сервер, показывает изменения в браузере 
const rename = require('gulp-rename');                     // переименовыватель 
const autoprefixer = require('gulp-autoprefixer');         // автопрефиксер для древних браузеров
const clean = require('gulp-clean');                       //удаляет файлы
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const svgSprite = require('gulp-svg-sprite');
const include = require('gulp-include');
const pug = require('gulp-pug');

function pughtml() {
  
  return src('src/pages/*.pug')
  .pipe(pug({pretty: '\t',}))
  .pipe(dest('app/'))
  .pipe(browserSync.stream())
}


function fonts () {
  return src('src/fonts/*.*')
  .pipe(fonter({
    formats:['woff', 'ttf' ]
  }))

  .pipe(src('src/fonts/*.ttf'))
  .pipe(ttf2woff2())

 .pipe(dest('app/fonts'))
}


function sprite () {     // создаем спрайт svg и в app и в src 
return src('src/images/*.svg')
.pipe(svgSprite({
  mode: {
    stack: {
      sprite: '../sprite.svg',
      example: true
    }
  }
}))
.pipe(dest('app/images'))
}




function images() {     // уменьшатель картинок кроме svg
   return src(['src/images/*.*', '!src/images/*.svg','!src/images/*.gif'])
   .pipe(newer('app/images'))
   .pipe(avif({ qulity: 50 }))

  .pipe(src(['src/images/*.*', '!src/images/*.svg','!src/images/*.gif']))
  .pipe(newer('app/images'))
  .pipe(webp())

  .pipe(src(['src/images/*.*', '!src/images/*.svg','!src/images/*.gif']))
  .pipe(newer('app/images'))
  .pipe(imagemin())

   .pipe(dest('app/images'))
}

function gifcopy() {
  return src('src/images/*.gif')
  .pipe(dest('app/images'))
}


function watching() {            //СЛЕДИЛКА и Живой сервер
  browserSync.init({
    server: {
      baseDir: "app/"
    }
  });
  watch(['src/components/*.pug','src/blocks/**/*.pug','src/blocks_s/**/*.pug','src/pages/*.pug'], pughtml)
  watch(['src/sass/*.sass','src/blocks/**/*.sass','src/blocks_s/**/*.sass'], styles)
  watch(['src/images'], images)
  watch(['src/images/*.svg'], sprite)
  watch(['src/js/main.js', 'src/blocks/**/*.js'], scripts)
  watch(['src/js/libs/*.js'], jscopy)
  watch(['src/images/*.gif'], gifcopy)
  watch(['src/**/*.html']).on('change', browserSync.reload);
}

function scripts() {            //обработчик js
  return src(['src/js/main.js', 'src/blocks/**/*.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function jscopy() {
  return src('src/js/libs/*/*.js')
  .pipe(dest('app/js/libs'))
}


function styles () {            //обработчик Стилей
  return src('src/sass/style.sass')
  .pipe(sass())
  .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version']}))
  .pipe(sass({outputStyle: 'compressed' }))
  .pipe(rename('style.min.css'))
  .pipe(dest('app/css'))
  .pipe(browserSync.stream())
}



function html () {            //перекидывает все html из src в app 
  return src(['src/pages/*.html','src/*.html'])
  .pipe(dest('app/'))
  .pipe(browserSync.stream())
}

function cleanapp() {
  return src('app')
  .pipe(clean())
}



exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.images = images;
exports.sprite = sprite;
exports.fonts = fonts;
exports.pughtml = pughtml;


exports.clean = series(cleanapp, html, styles, scripts)
exports.default = parallel(pughtml, sprite, fonts, html ,styles, scripts, jscopy, gifcopy, images, watching);