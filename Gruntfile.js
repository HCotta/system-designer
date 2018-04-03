/*
 * System Designer
 *
 * https://designfirst.io/systemdesigner/
 *
 * Copyright 2018 Erwan Carriou
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function (grunt) {

  // load tasks
  require('load-grunt-tasks')(grunt);

  // load configuration
  grunt.initConfig({
    watch: grunt.file.readJSON('tasks/watch.json'),
    clean: grunt.file.readJSON('tasks/clean.json'),
    copy: grunt.file.readJSON('tasks/copy.json'),
    prettier: grunt.file.readJSON('tasks/prettier.json'),
    json_merge: grunt.file.readJSON('tasks/json_merge.json'),
    connect: grunt.file.readJSON('tasks/connect.json'),
    concat: grunt.file.readJSON('tasks/concat.json'),
    mocha_istanbul: grunt.file.readJSON('tasks/mocha_istanbul.json')
  });

  // non trivial copy
  grunt.config.merge({
    'copy': {
      'electron-kludge': {
        'expand': true,
        'cwd': 'dist',
        'src': ['*.html', 'app/index.html'],
        'dest': 'dist',
        'options': {
          'process': content =>
            content.replace('<script src=\"lib/jquery/jquery.min.js\"></script>', '<script>window.$ = window.jQuery = require(\"./lib/jquery/jquery.min.js\");</script>')
        },
      },
      'minify-json': {
        'expand': true,
        'cwd': 'dist/systems',
        'src': ['*.json'],
        'dest': 'dist/systems',
        'options': {
          'process': content => JSON.stringify(JSON.parse(content))
        }
      },
      'web-livereload': {
        'expand': true,
        'cwd': 'dist',
        'src': ['*.html', 'app/index.html'],
        'dest': 'dist',
        'options': {
          'process': content =>
            content.replace('<html manifest=\"system-designer.appcache\">', '<html>')
              .replace('<html manifest=\"../system-designer.appcache\">', '<html>')
              .replace('</body>', '<script src=\"//localhost:35729/livereload.js\"></script></body>')
        },
      }
    }
  });

  // start the dev mode
  grunt.registerTask('dev', [
    'clean:build',
    'copy:web-folder',
    'copy:libraries',
    'copy:ace',
    'copy:web-files',
    'json_merge:web-systems',
    'copy:web-livereload',
    'connect:watch',
    'watch'
  ]);

  // start the server
  grunt.registerTask('start',
    'connect:web-server'
  );

  // build for web
  grunt.registerTask('web', [
    'clean:build',
    'prettier',
    'copy:web-folder',
    'copy:libraries',
    'copy:ace',
    'copy:web-files',
    'json_merge:web-systems',
    'copy:minify-json',
    'test'
  ]);

  // build for electron
  grunt.registerTask('electron', [
    'clean:build',
    'prettier',
    'copy:web-folder',
    'copy:libraries',
    'copy:ace',
    'copy:electron-files',
    'copy:electron-kludge',
    'json_merge:electron-systems',
    'copy:minify-json',
  ]);

  // build for cordova
  grunt.registerTask('cordova', [
    'clean:build',
    'prettier',
    'copy:web-folder',
    'copy:libraries',
    'copy:codemirror',
    'copy:cordova-files',
    'json_merge:cordova-systems',
    'copy:minify-json',
    'concat:cordova-specific',
    'clean:systems',
  ]);

  // default build
  grunt.registerTask('build', [
    'web'
  ]);

  // default test
  grunt.registerTask('test', [
    'mocha_istanbul:smoketest'
  ]);
};