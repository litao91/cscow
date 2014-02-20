# Operator Overloading
## General Syntax of Operator Overloading
In C++, operators are overloaded in the form of **function with special
names**. As with other functions, overloaded operators can generally be
implemented either as a **member function of their left operand's type**
or as **non-member functions**.

A unary operator `@` (a place holder), applied to an object x, is invoked
either as `operator@(x)` or as `x.operator@()`.

A binary infix operator `@` applied to `x` and `y`, is called either as
`operator@(x,y)` or as `x.operator@(y)`
## Conversion Operators (also known as User Defined Conversions)
In C++ you can create conversion operators, operators that allow the
compiler to convert between your types and other defined types. There are
two types of conversion operators, implicit and explicit ones.

### Implicit Conversion Operators (C++98/C++03 and C++11)

An implicit conversion operator allows the compiler to implicitly convert
(like the conversion between int and long) the value of a user-defined
type to some other type.

The following is a simple class with an implicit conversion operator:
```c++
class my_string {
public:
  operator const char*() const {return data_;} // This is the conversion operator
private:
  const char* data_;
};
```
Implicit conversion operators, like one-argument constructors, are
user-defined conversions. Compilers will grant one user-defined conversion
when trying to match a call to an overloaded function.

```c++
void f(const char*);
my_string str;
f(str); // same as print( str.operator const char*() )
```
At first this seems very helpful, but the problem with this is that the
implicit conversion even kicks in when it isn’t expected to. In the
following code, `void f(const char*)` will be called because `my_string()` is
not an lvalue, so the first does not match:

```c++
void f(my_string&);
void f(const char*);

f(my_string());
```
Beginners easily get this wrong and even experienced C++ programmers are
sometimes surprised because the compiler picks an overload they didn’t
suspect. These problems can be mitigated by explicit conversion operators.

## Replacing `new` and `delete`
When you write a new expression like:
```c++
new T(arg);
```
Two things will happen:

* `operator new` is invoked to obtain raw memory
* then the appropriate constructor of `T` is invoked to turn this raw
  memory into a valid object.

Likewise, when you delete an object:

* First, it's destructor is called
* Then the memory is returned to `operator delete`.

The C++ standard library comes with a set of predefined `new` and `delete`
operators, the most important ones:
```c++
void* operator new(std::size_t) throw(std::bad_alloc); 
void  operator delete(void*) throw(); 
void* operator new[](std::size_t) throw(std::bad_alloc); 
void  operator delete[](void*) throw(); 
```
The first two for an object, the latter two for an array of objects.

If you provide your own version of these, they will **not overlad, but
replace** the ones from the standard library.


Note that `new` **just allocate the memory** and immediately after that
the compiler inserts the call to the constructor. So it's irrespective if
you call `new B`, `new B()`, or `new B(10)`;

The compiler interprets something like:
```c++
B *b = static_cast<B*>(B::operator new(sizeof(B)))->B();
B *b1 = static_cast<B*>(B::operator new(sizeof(B)))->B(10);
```

There is C++ syntax for calling a constructor explicitly:
```c++
new (B::operator new(sizeof(B))) B()
```

### Class-specific new and delete
You can overload new and delete for a specific class:
```c++
class my_class { 
  public: 
    // ... 
    void* operator new();
    void  operator delete(void*,std::size_t);
    void* operator new[](size_t);
    void  operator delete[](void*,std::size_t);
    // ... 
}; 
```
