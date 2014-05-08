# Headers and Includes

## Why header files

1. Speed up compile time.
* Keep code organized.
* Allows you to separate *interface* from *implementation*.

C++ programs are built in a two stage process:

1. Each source file is *compiled* in it's own.
* The compiler generates intermediate files for each compiled source
  file.(object files)
* The linker then *links* all the object files together, which generates
  the final binary

This means that each source file is *compiled separately* from other
source files. In terms of compiling, `a.cpp` is clueless as to what's
going on inside of `b.cpp`.

Example:

In `myclass.cpp`

```c++
class MyClass {
public:
    void foo();
    int bar;
};

void MyClass::foo() {
    // do stuff
}
```

In `main.cpp`:

```c++
int main() {
    MyClass a; // Compiler error: 'MyClass' is undefined
    return 0;
}
```

Although `MyClass` is declared in *your program*, it is not declared in
`main.cpp`, and therefore when you compile you get that error.

This is where header files comes in. Header files allow you to make the
*inteface* visible to other `.cpp` file, while keeping *implementation* in
it's own `.cpp`

```c++
// in myclass.h
class MyClass {
public:
    void foo();
    int bar;
};
```

```c++
// in myclass.cpp
class MyClass::foo() {

}
```

```c++
// in main.cpp
#include "myclass.h"
int main() {
    MyClass a; // no longer produce error
    return 0;
}
```

## Include Guards

Include twice:
```c++
#include "myclass.h" // define my class
#include "myclass.h" // compilation error -- MyClass already defined
```

Two precautions:
1. Only `#include` things you *need* to include
* Guard against incidental multiple includes with include guards

```c++
// x.h
#ifnef __X_H_INCLUDED__
#define __X_H_INCLUDED__
class X {};
#endif
```

## The right way to include
Classes you create will often have dependencies on other classes. A
derived class, for example, will always be dependent on its parent.

There are two kinds of dependencies you need to be aware of:
1. Stuff that can be forward declared
* Stuff that needs to be `#include`

If class `A` uses class `B`, then class `B` is one of class `A`'s
dependencies. Whether it can be forward declared or needs to be included
depends on how `B` is used within `A`

* Do nothing if `A` makes no references at all to `B`
* Do nothing if the only reference to `B` is a friend declaration
* Forward declare `B` if `A` contains a `B` pointer or reference `B* myb`;
* Forward declare `B` if one or more functions has a `B`
  object/pointer/reference as a **parameter**, or as a return type 
  `B MyFunction(B myB)`
* `#inclue "b.h"` if `B` is a parent class of `A`
* `include "b.h"` if `A` contains a `B` object: `B myB`

**Important note!!**

You want to to the **least drastic** option possible. Do nothing if you
can, but if you can't, forward declare if you can. But it's necessary then
`#include` other header.

Example:
```c++
//=================================
// include guard
#ifndef __MYCLASS_H_INCLUDED__
#define __MYCLASS_H_INCLUDED__

//=================================
// forward declared dependencies
class Foo;
class Bar;

//=================================
// included dependencies
#include <vector>
#include "parent.h"

//=================================
// the actual class
class MyClass : public Parent  // Parent object, so #include "parent.h"
{
public:
  std::vector<int> avector;    // vector object, so #include <vector>
  Foo* foo;                    // Foo pointer, so forward declare Foo
  void Func(Bar& bar);         // Bar reference, so forward declare Bar

  friend class MyFriend;       // friend declaration is not a dependency
                               //   don't do anything about MyFriend
};

#endif // __MYCLASS_H_INCLUDED__ 
```

Because `MyClass` only uses a pointer to `Foo` and not a full `Full`
object, we can forward declare `Foo`, and don't need to `#include
"foo.h"`.  You should *always forward declare what you can*, don't
`#include` unless it's necessary.

## Circular Dependencies
A circular dependency is when two or more classes depend on each other.
For example `A` depends on `B` and `B` depends on `A`.

If you stick to "the right way" and forwafd declare when you can instead
of `#include`, this usually isn't a problem.

Here is an example of why you should only `#inlude` what is necessary


```c++
// a.h -- assume it's guarded
#include "b.h" 

class A{B* b;};
```

```c++
//b.h -- assume it's guarded
#include "a.h"
class B{ A* a; };
```

This is a circular inclusion and is the result of one or more inludes that
shouldn't be there. Say for example, you compile `a.cpp`:

```c++
#include "a.h"
```

The compiler will do the following.

```c++
#include "a.h"

   // start compiling a.h
   #include "b.h"

      // start compiling b.h
      #include "a.h"

         // compilation of a.h skipped because it's guarded

      // resume compiling b.h
      class B { A* a };        // <--- ERROR, A is undeclared 
```

The compiler is not seeing the `A` until after the `B` gets compiled.
This is because of the circular inclusion problem. This is why you should
*always forward decare*

The circular inclusion problem may persist if both dependencies are
`#include` dependencies (can't be forward declared). This situation is
*conceptually impossible*. There is a fundamental design flaw. If A as `B`
object, and `B` has an `A` object, then `A` contains a `B`, etc, etc.

## Forward declare templates
When dealin with tempalte classes, things aren't not simple, consider:

```c++
// a.h

// included dependencies
#include "b.h"

// the class template
template <typename T>
class Tem
{
 /*...*/
  B b;
};

// class most commonly used with 'int'
typedef Tem<int> A;  // typedef'd as 'A' 
```

```c++
// b.h

// forward declared dependencies
class A;  // error!

// the class
class B
{
 /* ... */
  A* ptr;
};
```

While this seems perfectly logical, it doesn't work! (Although, logically
you really think it should. This is an irritation of the language).
Because `A` isn't really a class, but rather a typedef, the compiler will
bark at you. Also notice that we can't just `#include "a.h"` here because of
a circular dependency problem.

In order to forward declare `A`, we need typedef of it. Which means we
need to forward declare what it's typedef'd as.


```c++
template <typename T> class Tem;  // forward declare our template
typedef Tem<int> A;               // then typedef 'A' 
```


A more elegant way:

```c++
//a.h

#include "b.h"

template <typename T>
class Tem
{
 /*...*/
  B b;
};
```

```c++
//a_fwd.h

template <typename T> class Tem;
typedef Tem<int> A;
```

```c++
//b.h

#include "a_fwd.h"

class B
{
 /*...*/
  A* ptr;
};
```
