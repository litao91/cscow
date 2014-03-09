# ECMAScript Basics 
## Primitive Types
ECMAScript has five *primitive types*:

* Undefined
* Null
* Boolean
* Number
* String

*Type* is defined as a set of values, and each of the primitive types
defines a range of value it can contain as well as literal representations
of that type.

To determine if a vlue is in the range of values for a particular type,
ECMAScript provides the `typeof` operator.

Calling `typeof` on a variable or value returns one of the following:

* `undefined` 
* `boolean`
* `number`
* `string`
* `object` if the variable is of a **reference type** or of the Null type.

Unlike other languages, there's no separate data type for integers versus
floating-point values; the Number type represents all numbers.

## Reference Types
Reference types are commonly referred to as *classes*, which is to say
that hwen you have a reference value, you are dealing with an object. 

ECMAScript doesn't actually have classes in the traditional sense. In
fact, the word class doesn't appear in ECMA-262 except to examplain that
there are no classes. 

ECMAScript defines "object definitions" that are logically equivalent to
classes in other programming language.

Objects are created by the `new` operator and providing the name of the
class to instantiate. For example:

```javascript
var o = new Object();
```

ECMAScript requires parentheses to be used only if there are one or more
parameters, otherwise the parentheses can be safely omitted:

```javascript
var o = new Object;
```

### The object class
The `Object` class is the base class from which all ECMAScript classes
inherit. All the properties and methods of the Object class are also
present in the other classes>

The `Object` class has the following properties:

* `constructor` -- A reference value to the function that created the
  object, for `Object` class, this point to the native `Object()` function
* `prototype` -- A reference value to the object prototype for this
  object. For all classes, this returns an instance of `Object` by
  default.

The `Object` has several method:

* `hasOwnProperty(property)` -- Determines if a given property exists for
  the object. Specified as a string
* `isPrototypeOf(object)` -- Determines if the object is a prototype of
  another object.
* `propertyIsEnumerable(property)` -- If a given property can be
  enumerated by using `for.... in` statement.
* `toString()`
* `valueOf()` -- The most appropriate primitive value of this object.

### The Boolean Class
The `Boolean` class is the reference type for the Boolean primitive type:

```javascript
var oBooleanObject = new Boolean(true);
```

### The instanceof operator
The `instanceof` operator identifies the type of object you are working
with. Unlike `typeof`, `instanceof` requires the developer toe xplicitly
ask if an object is of a particular type:

```javascript
var oStringObject = new String("hello world");
alert(oStringObject instanceof String); // outputs "true"
```

## Functions
Functions are the heart of ECMAScript: a collection of statements that can
be run anywhere at anytime.

Functions are declared with the keyword `function`, followed by a set of
arguments, and finally by the code to execute enclosed in braces. The
basic syntax is:

```javascript
function functionName(arg0, arg1, ..., argN) {
    statements
}
```

For example:

```javascript
function sayHi(sName, sMessage) {
    alert("Hello " + name + "," + sMessage);
}
```

This function can then be called:

```javascript
sayHi("Nicholas", "how are you today")
```

### The Function Class
Functions are **full-fledged objects**. A `Function` class represents each
and every function a developer defines.

The syntax for creating a function using the `Function` class directly is
as follows:

```javascript
var functio_name = new Function(argument1, argument2, ..., argumentN,
function_body);
```

For example:

```javascript
var sayHi = new Function("sName", "sMessage", "alert(\"Hello \" + sName +
\", \" + sMessage + \");");
```

So functions are just reference types and they always behave as if using
the `Function` class explicitly created for them.

Note: Even though it's possible to create a function using the `Function`
constructor, it's best to avoid it because it's slower than defining the
function in the traditional manner. However, all functions are considered
instances of `Function`.

Because functions are reference types, they can also have properties and
methods. One property defined in ECMAScript is `length`

```javascript
function doAdd(iNum) {
    alert(iNum + 10);
}
alert(doAdd.length); // output "1", the number of argument
```

### Understanding Arguments
An ECMAScript function doesn't care how many arguments are passed in, nor
does it care about the data types of those arguments. Just because you
define a function to accept 

Arguments in ECMAScript are represented as an array internally. The array
is always passed to the function, but the function doesn't care what is in
the array.

There actually is an `arguments` object that can be accessed while inside
a function to retrieve the values of each argument that was passed in.
Therefore, function can be rewritten as:

```javascript
function sayHi() {
    alert("Hello " + arguments[0] + ", " + arguments[1]);
}
```

Another important thing is that `arguments` can be used in conjunction
with named arguments, such as:

```javascript
function doAdd(num1, num2) {
    if(arguments.length == 1) {
        alert(num1 + 10);
    } else if (arguments.length == 2) {
        alert(arguments[0] + num2);
    }
}
```






