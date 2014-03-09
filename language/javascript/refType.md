# Reference Types
A ref value is an instance of a specific *reference type*. Reference types
are structures used to group data dn functionality together and are often
**incorrectly** called *classes*.

Reference types are also sometimes called *object definitions*.

Again, objects are considered to be *instances* of a particular reference
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

## Function Declarations versus Function Expressions
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
## Function Internals
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
