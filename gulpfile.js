const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const exec = require('gulp-exec');
const eslint = require('gulp-eslint');
const del = require('del');

gulp.task('build', () => {
	return gulp.src('src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('lib'));
});

gulp.task('clean', () => {
	return del('lib/**');
});

gulp.task('lint', () => {
	return gulp.src('src/**/*.js')
	.pipe(eslint())
	.pipe(eslint.format())
	.pipe(eslint.failAfterError());
});

gulp.task('rebuild', gulp.series('clean', 'build'));
gulp.task('default', gulp.parallel('lint', 'rebuild'));

gulp.task('publish', gulp.series('default', () => {
	const version = require('./package.json').version;
	return gulp.src('.')
		.pipe(exec(`git commit -am "Prepare ${version} release"`))
		.pipe(exec(`git tag v${version}`))
		.pipe(exec(`git push --follow-tags`))
		.pipe(exec('npm publish'));
}));
