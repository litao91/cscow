# Variables, Scope, and Memory
## Primitive and Reference Values
ECMAScript variables may contain two different types of data

* Primitive values: simple atomic pieces of data
* Reference values: objects that may be made up of multiple values.

When a value is assigned to a variable, the JS engine determine if it's a
primitive or a reference.

Primitives (Undefined, Null, Boolean, Number, and String) are said to be
accessed *by value*, because actual value stored in the variable.

Refrence values are objects stored in memory, when you manipulate an
object, you're really working on *reference* to that object. Accessed *by
reference*

### Dynamic Properties
When you work with reference values, you can add, change, or delete
properties and methods at any time:

```javascript
var person = new Object()
person.name = "Nicholas";
alert(person.name); //"Nicholas"
```

Primitive values can't have properties added to them (although attempting
to do so won't cause an error

```javascript
var name = "Nicholas";
name.age = 27;
alert(name.age); // undefined
```

### Copying Values
A primitive value is assigned from one variable to another:

When a reference value is assigned from one variable to another, the
pointer is copied:

```javascript
var obj1 = new Object();
var obj2 = obj1;
obj1.name = "Nicholas";
alert(obj2.name); //"NIcholas"
```

### Argument Passing
All function arguments in ECMAScript are passed by value.

## Execution Context and Scope
The *context* defines what other data it has access to, as well as how it
should behave.

Each execution context has an associated *variable object* upon which all
of its defined variables and functions exist.

* The global execution context is the outermost one. In a browser, the
  global context is said to be that of *window* object.
* Each function call has its own execution context. It is pushed onto a
  context stack upon exec. Pop on exec finish.
* A *scope chain* of variable is created. -- ordered access to all
  variables and functions that an execution context has access to.
* The front of the scope chain is always the variable object of the
  context whose code is executing. *activation object* for function. An
  activation object starts with a single defined variable called
  `arguments`.

### Scope Chain Augmentation
Two primary types of execution contexts: global and function.

Certain statements cause a temporary addition to the front of the scope
chain that is later removed.

* The `catch` block in a `try-catch` statement
* A `with` statement: the specific object is added to the scope chain. 

### No Block-Level Scopes
Example:
```javascript
if(true) {
    var color = "blue";
}
alert(color); //"blue"
```

### Var declaration
When a var is declared with `var`, it is automatically added to the most
immediate context available, note that in `with` statement, the most
immediate is the function context.

If a variable is initialized without first being declared, it gets added
to the global context automatically:

```javascript
function add(num1, num2) {
    var sum = num1 + num2;
    return sum;
}

var result = add(10, 20); // 30
alert(sum); //csue an error since sum is not a valid var
```

If `var` is omitted:

```javascript
function add(num1, num2) {
    sum = num1 + num2;
    return sum;
}
var result = add(10, 20); //30
alert(sum); //30
```
