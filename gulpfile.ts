"use strict";

/**
 * Packages.
 */
const gulp = require("gulp");
const del = require("del");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
const sass = require("gulp-sass");
const tsc = require("gulp-typescript");
const tslint = require("gulp-tslint");
const runSequence = require("run-sequence");
const swPrecache = require("sw-precache");
const pkg = require("./package.json");
const browserSync = require("browser-sync");

/**
 * Configuration.
 */
const distFolder = "dist";
const distScripts = "dist/scripts";
const distImages = "dist/images";
const distSw = "dist/scripts/sw";

const tmpFolder = ".tmp";
const tmpScripts = ".tmp/scripts";
const tmpImages = ".tmp/images";
const tmpSw = ".tmp/scripts/sw";

const tsProject = tsc.createProject("tsconfig.json");
const reload = browserSync.reload;

/**
 * Clean task.
 */
gulp.task("clean", (x) => del([distFolder, tmpFolder], x));

/**
 * Lint ts.
 */
gulp.task("lint", () => {
  return gulp.src("app/**/**.ts")
    .pipe(tslint({ formatter: "verbose" }))
    .pipe(tslint.report());
});

/**
 * Compile task for ts.
 */
gulp.task("compile", ["lint"], () => {
  let tsResult = gulp.src(["app/scripts/app.ts", "app/**/*.ts"])
    .pipe(tsProject());
  return tsResult.js
    .pipe(concat("app.js"))
    .pipe(gulp.dest(distScripts))
    .pipe(gulp.dest(tmpScripts))
    .pipe(rename("app.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest(distScripts))
    .pipe(gulp.dest(tmpScripts));
});

/**
 * Styles task.
 */
gulp.task("styles", () => {
  // TODO: autoprefixer.

  return gulp.src("app/**/*.scss")
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(gulp.dest(distFolder))
    .pipe(gulp.dest(tmpFolder));
});

/**
 * Html task.
 */
gulp.task("html", () => {
  return gulp.src("app/**/*.html")
    .pipe(htmlmin({
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
    }))
    .pipe(gulp.dest(distFolder))
    // .pipe(gulp.dest(tmpFolder))
    ;
});

/**
 * Images task.
 */
gulp.task("images", () => {
  return gulp.src("app/images/*")
    .pipe(imagemin())
    .pipe(gulp.dest(distImages))
    .pipe(gulp.dest(tmpImages));
});

/**
 * Content task.
 */
gulp.task("content", () => {
  return gulp.src(["app/**/*", "!**/*.ts", "!**/*.scss", "!**/*.html", "!app/images/*", "!app/*.json"], { nodir: true })
    .pipe(gulp.dest(distFolder));
});

/**
 * Build task.
 */
gulp.task("build", (callback) => {
  runSequence("clean", ["compile", "styles", "html", "images", "content"], "generate-service-worker", callback);
});

/**
 * Service worker tasks.
 */
// Copy over the scripts that are used in importScripts as part of the generate-service-worker task.
gulp.task("copy-sw-scripts", () => {
  return gulp.src(["node_modules/sw-toolbox/sw-toolbox.js", "app/scripts/sw/runtime-caching.js"])
    .pipe(gulp.dest(distSw));
});

// See http://www.html5rocks.com/en/tutorials/service-worker/introduction/ for
// an in-depth explanation of what service workers are and why you should care.
// Generate a service worker file that will provide offline functionality for
// local resources. This should only be done for the "dist" directory, to allow
// live reload to work as expected when serving from the "app" directory.
gulp.task("generate-service-worker", ["copy-sw-scripts"], () => {
  const filepath = distFolder + "/service-worker.js";

  return swPrecache.write(filepath, {
    // Used to avoid cache conflicts when serving on localhost.
    cacheId: pkg.name || "web-starter-kit",
    // sw-toolbox.js needs to be listed first. It sets up methods used in runtime-caching.js.
    importScripts: ["scripts/sw/sw-toolbox.js", "scripts/sw/runtime-caching.js"],
    staticFileGlobs: [
      // Add/remove glob patterns to match your directory setup.
      `${distFolder}/images/**/*`,
      `${distFolder}/scripts/**/*.js`,
      `${distFolder}/styles/**/*.css`,
      `${distFolder}/*.{html,json}`],
    // Translates a static file path to the relative URL that it"s served from.
    // This is "/" rather than path.sep because the paths returned from
    // glob always use "/".
    stripPrefix: distFolder + "/",
  });
});


/**
 * Watch task.
 */
gulp.task("serve", ["compile", "styles"], () => {
  browserSync({
    // Customize the Browsersync console logging prefix
    logPrefix: "OFK",
    notify: false,
    port: 3000,
    // Allow scroll syncing across breakpoints
    // scrollElementMapping: ["main", ".mdl-layout"],
    // Run as an https by uncommenting "https: true"
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: [tmpFolder, "app"],
  });

  gulp.watch(["app/**/*.html"], reload);
  gulp.watch(["app/styles/**/*.{scss,css}"], ["styles", reload]);
  gulp.watch(["app/**/*.{js,ts}"], ["compile", reload]);
  gulp.watch(["app/images/**/*"], reload);
});