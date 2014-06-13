# Reference Types
A ref value is an instance of a specific *reference type*. Reference types
are structures used to group data and functionality together and are often
**incorrectly** called *classes*.

Reference types are also sometimes called *object definitions*.

Again, **objects** are *instances* of a particular reference
type.

New obj are created by using `new` operator followed by a *constructor*. A
constructor is simply a function whose purpose is to create a new object:

```javascript
var person = new Object();
```

## The Object Type
Two ways to explicitly create an instance of `Object`:

The first is to use the new operator with constructor

```javascript
var person = new Object();
person.name = "Nicholas";
person.age = 29;
```

The other way is use *object literal* notation:

```javascript
var person = {
    name: "Nicholas", 
    age: 29
};
```

It's also possible to create an object with only default properties:

```javascript
var person = {}; // same as new Object()
person.name = "Nicholas";
person.age = 29;
```

Developers tend to favor object literal notation. In fact, object literals
have become a preferred way of passing a large number of optional
arguments to a function.

## The Array Type
Ways to create arrays:

```javascript
var color = new Array();
var colors = new Array(20);// create an array with 3 items
var colors = new Array("red", "blue", "green");
var colors = ["red", "blue", "green"];
var names = []; //empty array
```

## The Regexp Type
```javascript
var exp = /pattern/flags
```

Example:

```javascript
// All instances of "at" in the string
var pattern1 = /at/g
// bat or cat, regardless of case
var pattern2 = /[bc]at/i;
var pattern3 = /.at/gi

var pattern2 = new RegExp("[bc]at", "i");
```

The primary method of `RegExp()` object is `exec()`

Example:

```javascript
var text = “cat, bat, sat, fat”; 
var pattern1 = /.at/;
var matches = pattern1.exec(text); 
alert(matches.index); //0
alert(matches[0]); //cat
alert(pattern1.lastIndex); //0
matches = pattern1.exec(text); 
alert(matches.index); //0
alert(matches[0]); //cat
alert(pattern1.lastIndex); //0
var pattern2 = /.at/g;
var matches = pattern2.exec(text); 
alert(matches.index); //0
alert(matches[0]); //cat
alert(pattern2.lastIndex); //0
matches = pattern2.exec(text); 
alert(matches.index); //5
alert(matches[0]); //bat
alert(pattern2.lastIndex); //8
```

## The Function Type
Functions are actually objects. Each function is an instance of the
`Function` type that has properties and methods just like any other
reference type.

Function names are simply pointers to function objects and are not
necessarily tied to the function itself.

Typically using function-declaration syntax:

```javascript
function sum(num1, num2) {
    return num1 + num2;
}
```

Almost equivalent to using function expressions
```javascript
var sum = function(num1, num2) {
    return num1 + num2
};
```

Using `Function` constructor:

```javascript
var sum = new Function(“num1”, “num2”, “return num1 + num2”); //not recommended
```

### Function Declarations versus Function Expressions
Function declarations are read and available in an execution context
before any code is executed, whereas function expressions aren't complete
until the execution reaches that line of code.

The following is correct

```javascript
alert(sum(10, 10))
function sum(num1, num2) {
    return num1 + num2;
}
```

The following will cause error:

```javascript
alert(sum(10, 10));
var sum = function(num1, num2) {
    return num1 + num2;
};
```
### Function Internals
Two special objects exist inside a function: `arguments` and `this`.

The `arguments` object has a property named `callee`, which is a pointer
to the function that owns the `arguments` object:

Example:

```
function factorial(num) {
    if (num <= 1) {
        return 1;
    } else {
        return num * arguments.callee(num - 1);
    }
}
```

### Function Properties and Methods
Each function has two properties: 

* `length`: number of named arguments
* `prototype`

`prototype` is the actual location of all instance methods for reference
types, meaning method such as `toString()` and `valueOf()` actually exist
on `prototype` and then accessed from the object instances.

Two additional functions `apply()` and `call()` for functions. They both
call the function with a specific `this` value.

ECMAScript 5 defines an additional method `bind()`. The `bind()` method
creates a new function instance with `this` value is *bound* to the value
that was passed into `bind()`.

## Primitive Wrapper Types
Three special reference types are designed to ease interaction with
primitive values: the `Boolean`, `Number` and `String`. These types can
act like the other reference types, but they also have special behavior
related to their primitive wrapper type equivalents

Every time a primitive value is read, an object of the corresponding
primitive wrapper type is created behind the scenes, allowing access to
any number of methods for manipulating the data.

This behavior allows the primitive string to act like an object.

The major different between ref types and primitive wrapper types is the
lifetime of the object. When you instantiate a reference type using a new
operator, it stays in memory until it goes out of scope, whereas
automatically created primitive wrapper objects exist for only one line of
code before they are destroyed.

Example:

```javascript
var s1 = "some text";
s1.color = "red";
alert(s1.color); //undefined
```

## Singleton Built-in Objects
Including the Global object and the Math object.

### The global object
It's not explicitly accessible. In fact, there is no
such thing as a global variable, all variables and functions defined
globally become properties of the `Global` object.

The `eval()` method, works like an entire interpreter and accepts a string
argument.

```javascript
eval("alert('hi')");
```

The code exec by `eval()` is considered to be part of the execution
context in which the call is made, and executed code has the same scope as
that context.
