var gulp = require('gulp');
var mocha = require('gulp-mocha');
var nodemon = require('gulp-nodemon');
var htmlmin = require('gulp-htmlmin');
var csso = require('gulp-csso');

var homedir = {
  public: './public',
  assets: './public/assets'
}

gulp.task('minifyHTML', function(){
  return gulp.src('./developer/*.html')
          .pipe(htmlmin({collapseWhitespace: true}))
          .pipe(gulp.dest(homedir.public));
})

gulp.task('minifyCSS', function(){
  return gulp.src('./developer/*.css')
          .pipe(csso())
          .pipe(gulp.dest(homedir.assets));
})

gulp.task('test-routes', function () {
  return gulp.src('app.spec.js').pipe(mocha());
});

gulp.task('go', function(){
  nodemon({
    script: 'app.js'
  }).on('start', ['test-routes']);

  var watcherCSS = gulp.watch('./developer/*.css', ['minifyCSS']);
  watcherCSS.on('change', function(event){
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  })

  var watcherHTML = gulp.watch('./developer/*.html', ['minifyHTML']);
  watcherHTML.on('change', function(event){
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  })
})
