/** *
 *    _██████╗_██╗___██╗██╗_____██████╗_
 *    ██╔════╝_██║___██║██║_____██╔══██╗
 *    ██║__███╗██║___██║██║_____██████╔╝
 *    ██║___██║██║___██║██║_____██╔═══╝_
 *    ╚██████╔╝╚██████╔╝███████╗██║_____
 *    _╚═════╝__╚═════╝_╚══════╝╚═╝_____
 *    __________________________________
 */
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const runSequence = require('run-sequence');
const pkg = require('./package.json');

const banner = [
  '/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @license <%= pkg.license %>',
  ' * @author <%= pkg.author %>',
  ' */',
  '',
].join('\n');
const AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10',
];
gulp.task('css', () =>
  gulp
    .src(['scss/main.scss'])
    .pipe(
      $.sass({
        precision: 10,
        onError: console.error.bind(console, 'Sass error:'),
      }),
    )
    .pipe(
      $.cssInlineImages({
        webRoot: 'scss',
      }),
    )
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp'))
    .pipe($.concat('style.css'))
    .pipe($.header(banner, { pkg }))
    .pipe(gulp.dest('./src'))
    .pipe($.if('*.css', $.csso()))
    .pipe($.concat('style.min.css'))
    .pipe($.header(banner, { pkg }))
    .pipe(gulp.dest('./src'))
    .pipe($.size({ title: 'styles' })),
);
/** *
 *      /$$$$$$  /$$   /$$ /$$       /$$$$$$$
 *     /$$__  $$| $$  | $$| $$      | $$__  $$
 *    | $$  \__/| $$  | $$| $$      | $$  \ $$
 *    | $$ /$$$$| $$  | $$| $$      | $$$$$$$/
 *    | $$|_  $$| $$  | $$| $$      | $$____/
 *    | $$  \ $$| $$  | $$| $$      | $$
 *    |  $$$$$$/|  $$$$$$/| $$$$$$$$| $$
 *     \______/  \______/ |________/|__/
 *
 *
 *
 */
// Prepare Output Directory
gulp.task(
  'prep',
  del.bind(
    null,
    ['_build', 'src/*.css', '.tmp'],
    { dot: true },
  ),
);
// Clean TMP Directory
gulp.task('clean', del.bind(null, ['.tmp'], { dot: true }));
// Copy all _build files to the public directory
gulp.task('replicate_css', () => {
  const sources = ['_build/css/*.css'];
  return gulp.src(sources).pipe(gulp.dest('./src'));
});
gulp.task('replicate', cb => {
  runSequence(['replicate_css'], cb);
});
// Our default task (executed by calling the "gulp" command)
gulp.task('default', ['prep'], cb => {
  runSequence(['css'], ['replicate'], ['clean'], cb);
});
