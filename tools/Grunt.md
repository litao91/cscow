# Grunt
## Getting start
Grunt is an automated deployment tool for web front end. 

```
npm install -g grunt-cli
```
##Preparing a new Grunt project
A typical setup will involve adding two files to your project
`package.json` and `Gruntfile.js`

* `package.json`: list grunt and grunt plugins in `devDependencies`
* Gruntfile: `Gruntfile.js` or `Gruntfile.coffee`, configure or define
  tasks and load Grunt plugins.

## The gruntfile
A `Gruntfile` is comprised of the following parts:
* The "wrapper" function
* Project and Task Configuration
* Load Grunt plugings and tasks
* Custom tasks

Example:
```javascript
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};
```
When `grunt` is run on the command line, the `uglify` task will be run by
default.

## The newer task
The `newer` task doesn't require any special configuration. To use it,
just add `newer` as the first argument when running other tasks
