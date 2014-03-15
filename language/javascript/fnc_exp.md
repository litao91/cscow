# Function Expressions
## Anonymous Function
Function declaration

```javascript
function functionName(arg0, arg1, arg2) {
//function body
}
```

Anonymous function:

```javascript
var functionName = function(arg0, arg1, arg2){
//function body
};
```

Key of function declaration, *function declaration boisting*

```javascript
sayHi();
function sayHi(){
    alert(“Hi!”);
}
```

The following doesn't work.

```javascript
sayHi(); //error – function doesn’t exist yet
var sayHi = function(){
    alert(“Hi!”);
};
```

## Recursion

```javascript
function factorial(num){
    if (num <= 1){
        return 1;
    } else {
        return num * arguments.callee(num-1);
    }
}
```

Note that `arguments.callee` is not accessible to script running in strict
mode. Instead you can use **named function expression**

```javascript
var factorial = (function f(num){
    if (num <= 1){
        return 1;
    } else {
        return num * f(num-1);
    }
});
```

## Closures
Closures are functions that have access to variables from another
function’s scope.

When a function is called, an execution context is created, and its scope
chain is created. The activation object for the function is initialized
with values for `arguments` and any named arguments. The outer function’s
activation object is the second object in the scope chain. This process
continues for all containing functions until the scope chain terminates
with the global execution context. 

Example:

```javascript
function createComparisonFunction(propertyName) {
    return function(object1, object2){
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        if (value1 < value2){
            return -1;
        } else if (value1 > value2){
            return 1;
        } else {
            return 0;
        }
    };
}

//create function
var compareNames = createComparisonFunction(“name”);
//call function
var result = compareNames({ name: “Nicholas” }, { name: “Greg”});
//dereference function - memory can now be reclaimed
compareNames = null;
```

The scope-chain relation

![](figures/scope_chain.png)

### Closure and Variables
There is one notable side effect of this scope-chain configuration. The
closure always gets the last value of any variable from the containing
function. Remember that the closure stores a reference to the entire
variable object, not just to a particular variable
