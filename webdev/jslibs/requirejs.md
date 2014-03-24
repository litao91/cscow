# RequireJS
RequireJS takes a different approach to script loading than traditional
`<script>` tags. The primary goal is to encourage **modular code**.

RequireJS loads all code relative to a baseUrl. The baseUrl is normally
set to the same directory as the script used in a `data-main` attribute
for the top level script to load for a page.

The `data-main` attribute is a special attribute that require.js will
check to start script loading.

Example:

```javascript
<script data-main="scripts/main.js" src="scripts/require.js"></script>
```

This sets the baseUrl to the "scripts" directory, and loads a script that
will have a module ID of `main`.

Or, baseUrl can be set manually via the RequireJS config. If there is no
explicit config and data-main is not used, then the default baseUrl is the
directory that contains the HTML page running RequireJS.


Example:

A Directory layout like this:

    www/
        index.html
        js/
            app/
                sub.js
            lib/
                jquery.js
                canvas.js
            app.js

In index.html:

```html
<script data-main="js/app.js" scr="js/require.js"></script>
```

And in `app.js`:

```javascript
requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app'
    }
});

// Start the main app logic.
requirejs(['jquery', 'canvas', 'app/sub'],
function   ($,        canvas,   sub) {
    //jQuery, canvas and the app/sub module are all
    //loaded and can be used here now.
});
```

## `data-main` Entry Point
The `data-main` attribute is a special attribute that require.js will
check to start strip loading.

## Define a Mudule
A module is different from a traditional script file in that it defines a
well-scoped object that avoids polluting the global namespace. It can
explicitly list its dependencies and get a handle on those dependencies
without needing to refer to global objects, but instead receive the
dependencies as arguments to the function that defines the module.

Modules in RequireJS are an extension of the Module Pattern. There should
only be **one** module definition per file on disk. The modules can be
grouped into optimized bundles by the optimization tool.

The returned value of the module what we get by calling `require()` (?)

### Simple Name/Value 
```javascript
//Inside file my/shirt.js:
define({
    color: "black",
    size: "unisize"
});
```

### Definition Functions
If needs some function to do setup work:

```javascript
//my/shirt.js now does setup work
//before returning its module definition.
define(function () {
    //Do setup work here

    return {
        color: "black",
        size: "unisize"
    }
});
```

### Definition Function with Dependencies

* First argument: an array of dependencies names
* Second argument: definition function 

```javascript
//my/shirt.js now has some dependencies, a cart and inventory
//module in the same directory as shirt.js
define(["./cart", "./inventory"], function(cart, inventory) {
        //return an object to define the "my/shirt" module.
        return {
            color: "blue",
            size: "large",
            addToCart: function() {
                inventory.decrement(this);
                cart.add(this);
            }
        }
    }
);
```

In this example, `my/shirt` module is created, it depends on `my/cart` and
`my/inventory`. On disk the files are structured:

* `my/cart.js`
* `my/inventory.js`
* `my/shirt.js`

The function is not called until `my/cart` and `my/inventory` modules have
been loaded.

### Define Module as a function:

```javascript
//A module definition inside foo/title.js. It uses
//my/cart and my/inventory modules from before,
//but since foo/title.js is in a different directory than
//the "my" modules, it uses the "my" in the module dependency
//name to find them. The "my" part of the name can be mapped
//to any directory, but by default, it is assumed to be a
//sibling to the "foo" directory.
define(["my/cart", "my/inventory"],
    function(cart, inventory) {
        //return a function to define "foo/title".
        //It gets or sets the window title.
        return function(title) {
            return title ? (window.title = title) :
                   inventory.storeName + ' ' + cart.name;
        }
    }
);
```

### Define a Module with Simplified CommonJS Wrapper
Example:

```javascript
define(function(require, exports, module) {
        var a = require('a'),
            b = require('b');

        //Return the module value
        return function () {};
    }
);
```

### Define Module with a name
```javascript
//Explicitly defines the "foo/title" module:
define("foo/title",
    ["my/cart", "my/inventory"],
    function(cart, inventory) {
        //Define foo/title object in here.
   }
);
```

### Circular Dependencies
If you define a circular dependency (`a` needs `b` and `b` needs `a`),
then in this case in this case when `b`'s module function is called, it
will get an undefined value for `a`. 

Example:

```javascript
//Inside b.js:
define(["require", "a"],
    function(require, a) {
        //"a" in this case will be null if a also asked for b,
        //a circular dependency.
        return function(title) {
            return require("a").doSomething();
        }
    }
);
```
