var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var htmlmin = require('gulp-htmlmin');
var csso = require('gulp-csso');

var homedir = {
  public: './public',
  assets: './public/assets'
}

gulp.task('minifyHTML', function(){
  return gulp.src('./*html')
          .pipe(htmlmin({collapseWhitespace: true}))
          .pipe(gulp.dest(homedir.public));
})

gulp.task('minifyCSS', function(){
  return gulp.src('./*.css')
          .pipe(csso())
          .pipe(gulp.dest(homedir.assets));
})

gulp.task('server', function(){
  nodemon({
    script: 'app.js'
  })
  var watcherCSS = gulp.watch('./*.css', ['minifyCSS']);
  watcherCSS.on('change', function(event){
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  })
  var watcherHTML = gulp.watch('./*.html', ['minifyHTML']);
  watcherCSS.on('change', function(event){
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  })
})
