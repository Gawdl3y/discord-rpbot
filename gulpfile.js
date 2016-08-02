const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const exec = require('gulp-exec');
const del = require('del');

gulp.task('default', ['clean', 'build']);

gulp.task('build', ['clean'], () => {
	return gulp.src('src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('lib'));
});

gulp.task('clean', () => {
	return del('lib/**');
});

gulp.task('publish', ['clean', 'build'], () => {
	const version = process.env.npm_package_version ? process.env.npm_package_version : require('./package.json').version;
	let chain = gulp.src('.')
		.pipe(exec(`git tag v${version}`))
		.pipe(exec(`git push origin v${version}`));
	if(!process.env.npm_package_version) return chain.pipe(exec('npm publish'));
	return chain;
});
