# C++ Templates
Template largely uses the angle brackets (`<>`), of the form:

    <Content>

Where `Content` can be:

1. `class T`/ `typename T`
* A data type, which maps to `T`
* An integral specification
* An integral constant/pointer/reference which maps to specification
  mentioned above

For 1 and 2, the symbol `T` is nothing but some data-type.

Two types of Templates:
* Function Templates
* Class Templates

## Function Templates
Here is a templated function:
    
    template<class T>
    void PrintTwice(T data) {
        cout << "Twice " << data * 2 <<  endl;
    }

The first line:

    template<class T>

Tells the compiler that this is a `function-template`. The actual meaning
of `T` would be deduced by compiler depending on the argument passed to
this function. Here, the name, `T` is known as **template type
parameter**.

For instance, if we call the function as:
    
    PrintTwice(124);

`T` will be replaced by compiler as `int`, and compiler will
**instantiate** this template-function as:
    
    void PrintTwice(int data) {
        cout << "Twice: " << data * 2 << endl;
    }

And similarly, if you call

    PrintTwice(4.5547)

A `double` instance will be generated. The code is duplicated, but these
two overloads are instantiated by the compiler and not by the programmer.
The true benefit is that you need not to do *copy-pasting* the same code.
With templates, only the required instantiations of function would get
into final executable. 

Now another function template:

    template<typename T> 
    T Twice(T data) {
        return data * 2;
    }

You should have noticed `typename` is used, instead of `class`. For
template programming, these two keywords are very much the same. There is
a historical reason for having two keywords for same purpose.

However, there are instances where you can *only* use the newer keyword -
`typename`. When a particular type is defined in another type, and is
dependent on some template parameter.

When we call this function as 

    cout << Twice(10);
    cout << Twice(3.14);
    cout << Twice(Twice(55));

Following set of functions would be generated:

    int Twice(int data) { ...}
    int Twice(double data) {...}

Two things:

1. In the third of code snipped above, `Twice` is called twice - the
   return value/type of the first call would be the argument/type of
   second call. Hence, both calls are of `int` type. 
* If a template function is instantiated for a particular data-type,
  compiler would re-use the same function instance, if the function is
  invoked again for same data-type. 

Another example:

    template < class T>  
    T Add(T n1, T n2) {
        return n1 + n2;
    }

Note: The template parameter `T` is reused for both of the arguments.

Slightly modified version:

    template<class T>
    T Add(T n1, T n2)
    {
        T result;
        result = n1 + n2;
        
        return result;
    }

The type parameter `T` is used within the function's body. How the compier
would know what is type of `result`, when it tries to compile/parse the
function `Add`. 

Well, while looking at the body of function template (Add), compiler would
not see if `T` (template type parameter) is correct or not. It would simply
check for basic syntax (such as semi-colons, proper usage of keywords,
matching braces etc), and would report errors for those basic checks.
Again, it depends on compiler to compiler how it handles the template
code, but it would not report any errors resulting due to template type
parameters. It would not check if:

* `T` is having a default constructor (so that `T result;` is valid)
* `T` supports the usage of `operator +` (so `n1+n2` is valid).
* `T` has an accessible copy/move constructor ( so that `return` statement
  succeeds. )

Essentially, the compiler would have to compile the template code in two
phases: 

* Once for basic syntax check
* Later for **each instantiation** of function template - where it would
  perform actual code compilation against the template data-types.

### Pointers, References and Arrays with Templates
Code sample:
    template<class T>
    double GetAverage(T tArray[], int nElements)
    {
        T tSum = T(); // tSum = 0

        for (int nIndex = 0; nIndex < nElements; ++nIndex)
        {
            tSum += tArray[nIndex];
        }

        // Whatever type of T is, convert to double
        return double(tSum) / nElements;
    }
      

    int main()
    {
        int  IntArray[5] = {100, 200, 400, 500, 1000};
        float FloatArray[3] = { 1.55f, 5.44f, 12.36f};

        cout << GetAverage(IntArray, 5);
        cout << GetAverage(FloatArray, 3);
    }

First call of `GetAverage`, where `IntArray` is passed, compiler would
instantiate this function as:

    double GetAverage(int tArray[], int nElements);

And similarly for `float`. Note that `T` may be a class, which may not be
converted to double.

Note:

1. A function template may have template type arguments, along with non
   template type arguments. 
* Template type-parameter is just `T`, and not `T*` or `T[]`, compilers
  are smart enough to deduce the type `int` from an `int[]` or `int*`. 

Most often, you would come across and would use initialization like:
    
    T tSum = T();

It essentially means: call the **default constructor** for this data type.

Since the template type `T` may be any type, it must have `+= operator`
available. If not, compiler would raise an error that acutal type doesn't
have this operator, or any possible conversion. 

Similarly, the type `T` must be able to convert itself to `double`
(`return` statement).

Other examples:

    template<class T>
    void TwiceIt(T& tData)
    {
        tData *= 2;    
        // tData = tData + tData;
    }

`T&` as a function template for underlying type `T`.

It is also possible and very reasonable to add `const` attribute to the
parameter which is arriving to function template, and that parameter
would not be changed by function template. Take it easy, it is as simple
as this:

    template<class TYPE>
    void PrintTwice(const TYPE& data)
    {
        cout<<"Twice: " << data * 2 << endl;
    }

Similarly:
    template<class TYPE>
    TYPE Twice(const TYPE& data) // No change for return type
    {
       return data * 2;
    }

    template<class T>
    T Add(const T& n1, const T& n2) // No return type change
    {
        return n1 + n2;
    }

    template<class T>
    GetAverage(const T tArray[], int nElements)
    // GetAverage(const T* tArray, int nElements)
    {}

Note that it is not possible to have reference and `const` added to return
type, unless we intended to return reference ( or pointer) of original
object that we passed to the function template.

Example:

    template<class T>
    T& GetMax(T& t1, T& t2)
    {
        if (t1 > t2)
        {
            return t2;
        }
        // else 
        return t2;
    }

How we utilize return reference:

    int x = 50;
    int y = 64;

    // Set the max value to zero (0)
    GetMax(x,y) = 0;

### Multiple Types with Function Templates
Example:

    template<class T1, class T2>
    void PrintNumbers(const T1& t1Data, const T2& t2Data)
    {
         cout << "First value:" << t1Data;
         cout << "Second value:" << t2Data;
    }

And we can simply call it as 

    PrintNumbers(10, 100);    // int, int
    PrintNumbers(14, 14.5);   // int, double
    PrintNumbers(59.66, 150); // double, int

Realize that second and third instantiations are not same, as `T1` and `T2`
would infer different data-types (int, double and double,int). Compiler
will not perform any automatic conversion, as it might do for normal
function call - A normal function taking int, for example, may be passed
short, or vice-versa. But with templates, if you pass short - it is
absolutely short, not (upgraded to) int. So, if you pass (short, int),
(short, short), (long, int) - this would result in three different
instantiations for `PrintNumbers`!

In similar fashion, function templates may have 3 or more parameters, and
each of them would map to the argument types specified in function call.

---

Assume there is a non-templated function:

    void Show(int nData);

And you call it:

    Show( 120 );    // 1
    Show( 'X' );    // 2
    Show( 55.64 );  // 3

* Call 1 is valid.
* Call 2 is valid call since we are passing `char`, which will be **promoted**
  by compiler to `int`.
* Call 3 would demand demotion of value - compiler has to convert `double`
  to `int`, and hence 55 would be passed instead of 55.64. This will
  trigger appropriate compiler warning.

One solution: modify the function such that it takes `double`. But that
wouldn't support all types and may not fit in, or convertible to,
`double`. 

With template, you can write it a template function instead:

    template<class Type>
    void show(Type tData) {}

But what if you wanted to pass int to function template `Show`, but wich
the compiler instantiates as if `double` was passed?

    Show<double>(1234)

Which instantiates the following:
    
    void Show(double)

### Function Template VS. Template Function
There is a difference between **function template** and **template
function**.

A *function template* is body of a function that is bracketed around
`template` keyword, which is not an actual function, and will not be fully
compiled by compiler, and is not accountable by the linker. At least one
call, for particular data-type(s) is needed to instantiate it, and put
into accountability of compiler and linker. 

A *template function* is an instance of a functin template, which is
produced when you call it, or cause it to get instantiated for particular
data type. It's a valid function. 

An instance of a function template is not a normal function. An instance
of function template:

    template<class T>
    void Show(T data){}

For template argument `double`, it is **not**:

    void Show(double data){}

But actually:

    void Show<double>(double x) {}

### Explicit Template Argument Specification
You can call this function template as:

    PrintNumbers<double, double>(10, 100);    // int, int
    PrintNumbers<double, double>(14, 14.5);   // int, double
    PrintNumbers<double, double>(59.66, 150); // double, int

Which produce only the following template function:

    void PrintNumbers<double, double>(const double& t1Data, const T2& t2Data) {}

And the concept of passing template type parameters this way, from the
call-site, is known as **Explicit Template Argument Specification**.

Reason to use Explicit Template Argument:

#### You want only specific type to be passed
Example, there is one function template, taking **two** arguments:

    template<class T>
    T max(T t1, T t2)
    {
       if (t1 > t2)
          return t1;
       return t2;
    }

And you attempt to call it as:

    max(120, 14.55);

It would cause a compiler error, mentioning there is an ambiguity with
template-type `T`. You are asking the compiler to deduce one type, for two
types.

There you use explicit argument specification:

    max<double>(120, 14.55); // Instantiates max<double>(double, double)

#### When function-template takes template-type, but not from arguments
Example: 
    template<class T>
    void PrintSize()
    {
       cout << "Size of this type:" << sizeof(T);
    }

You must call it like:
    
    PrintSize<float>();

#### When has a return type
    template<class T>
    T SumOfNumbers(int a, int b)
    {
       T t = T(); // Call default CTOR for T

       t = T(a)+b;

     
       return t;
    }

You would call it as 

    double nSum;
    nSum = SumOfNumbers<double>(120,200);

### Default Arguments with Function Templates
This is not about default template-type arguments. Default template-types,
is not allowed with function-template. 

As you know, a C++ function may have default arguments. The default-ness
may only go from right to left, meaning, if nth argument is required to be
default, (n+1)th must also be default, and so on till last argument of
function.

Example:

    template<class T>
    void PrintNumbers(T array[], int array_size, T filter = T())
    {
       for(int nIndex = 0; nIndex < array_size; ++nIndex)
       {
           if ( array[nIndex] != filter) // Print if not filtered
               cout << array[nIndex];
       }
    }

## Class Templates
Example:

    template<class T>
    class Item
    {
        T Data;
    public:
        Item() : Data( T() )
        {}

        void SetData(T nValue)
        {
            Data = nValue;
        }

        T GetData() const
        {
            return Data;
        }

        void PrintData()
        {
            cout << Data;
        }
    };

Syntax:
    
    template<class T>
    class Item

Note that the keyword `class` is used two times
* template type specification (`T`), and
* Specify that this is a C++ declaration

Usage:

    Item<int> item1;
    item1.SetData(120);
    item1.PrintData();
