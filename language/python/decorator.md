Python Decorators Explained
===========================
A Python decorator is a specific change to the Python syntax that allows
us to more conveniently alter functions and methods.

## Functions are first class in Python
Returning a function as value
```python
def outer():
    def inner():
        print("inside inner")
    return inner # reuturning a function

foo = outer()
foo() # output: Inside inner
```

## Closures

Example:

```python
def outer():
    x = 1
    def inner():
        print(x) # 1
    return inner

foo = outer()
foo.func_closure # output: (<cell at 0x...: int object at 0x...>,)
```

`x` is a local variable in function *outer*. When *inner* prints `x` at
point `#1`, python looks for a local variable to `inner` and not finding,
it looks in the enclosing scope, which is the function `outer`, finding it
here. 

However, `x` is local to the function `outer`, which means **it exists
while the function outer is running**. 

We aren't able to call `inner` till after the return of `outer` so
according to our model of how Python works, `x` shouldn't exist anymore by
the time we call `inner`. 

It turns out that our returned `inner` function **does work**. Python
supports a feature called **function closures** which means that inner
function defined in non-global scope remember what their enclosing
namespaces looked like **at definition time**.

Example:
```python
def outer(x):
    def inner():
        print(x)
    return inner

print1 = outer(1)
print2 = outer(2)
print1() # > 1
print2() # > 2
```

## Decorators
A decorator is just a callable that takes a function as an argument and
returns a replacement function.

Example:
```python
def outer(some_func):
    def inner():
        print("before some_func")
        ret = some_func()
        return ret+1
    return inner

def foo():
    return 1

decorated = outer(foo)
decorated() 
# before some_func
# 2
```

We could say that the variable `decroated` is a decorated version of `foo`
-- it's `foo` plus something.

Imagine we have a library that gives us coordinate objects. Perhaps they
are primarily made up of `x` and `y` coordinate pairs. Sadly the
coordinate objects don't support mathematical operators and we can't
modify the source so we can't add this support ourselves. 

We want to make `add` and `sub` functions that take two coordinate objects
and do the appropriate mathematical thing.

example:

```python
class Coordinate(object):
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __repr__(self):
        return "Coord: " + str(self.__dict__)


def add(a, b):
    return Coordinate(a.x + b.x, a.y + b.y)

def sub(a, b):
    return Coordinate(a.x - b.x, a.y - b.y)
```

Now we want to add a checker to check the bound:
```python
def wrapper(func):
     def checker(a, b): # 1
         if a.x < 0 or a.y < 0:
             a = Coordinate(a.x if a.x > 0 else 0, a.y if a.y > 0 else 0)
         if b.x < 0 or b.y < 0:
             b = Coordinate(b.x if b.x > 0 else 0, b.y if b.y > 0 else 0)
         ret = func(a, b)
         if ret.x < 0 or ret.y < 0:
             ret = Coordinate(ret.x if ret.x > 0 else 0, ret.y if ret.y > 0 else 0)
         return ret
     return checker

sub = wrapper(add)
sub = wrapper(sub)
```
It’s a matter of opinion as to whether doing it this makes our code
cleaner: isolating the bounds checking in its own function and applying it
to all the functions we care to by wrapping them with a decorator.

## The `@` symbol applies a decorator to a function
In code samples above we decorated our function by replacing the variable
containing the function with a wrapped version:
```
add = wrapper(add)
```

But we can decorate it with the `@` symbol like:
```python
@wrapper
def add(a, b):
    return Coordinate(a.x + b.x, a.y + b.y)
```

Python just adds some syntactic sugar to make what is going very explicit.

## `*args` and `**kwargs`
Let’s write a decorator that increments a counter for every function call
of every decorated function without changing any of it’s decorated
functions. This means it would have to accept the calling signature of any
of the functions that it decorates and also call the functions it
decorates passing on whatever arguments were passed to it.
```python
def one(*args):
    print args # 1

one() #-> ()
one(1, 2, 3) #-> (1, 2, 3)


def two(x, y, *args): # 2
    print x, y, args


two('a', 'b', 'c') #-> a b ('c',)
```

We introduce `**` which does for dictionaries and key/val pairs:
```python
def foo(**kwargs):
    print kwargs

foo() # -> {}

foo(x=1, y=2) # -> {}
{'y': 2, 'x': 1}
```

## More generic decorators

```python
def logger(func):
    def inner(*args, **kwargs): #1
        print "Arguments were: %s, %s" % (args, kwargs)
        return func(*args, **kwargs) #2
    return inner
```

```python
@logger
def foo1(x, y=1):
 return x * y

@logger
def foo2():
 return 2
```

