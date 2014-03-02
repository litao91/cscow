# STL
## Some C++ syntax
### Static Template Member
```c++
template<typename T>
class testClass {
public:
    static int _data;
};

int testClass<int>::_data = 1;
int testClass<char>::_data = 2;
```

### Member Templates
```c++
class alloc {};

template<class T, class Alloc = alloc>
class vector {
public:
    typedef T value_type
    typedef value_type* iterator;

    // member template
    template<class I>
    void insert(iterator position, I first, I last) {
        cout << "insert()" << endl;
    }
};
```

### Limited Default Templates
Note that the class `Sequence` is defined depending on the previous
class type

```c++
template <class T, class Sequence = deque<T> >
class stack {
public:
    stack() {cout << "stack" << endl; }
private:
    Sequence c;
};
```

### Null Template Args

```c++
template<class T, class Sequence>
class stack;

template <class T, class Sequence>
bool operator==(const stack<T, Sequence>& x,
                const stack<T, Sequence>& x);

template <class T, class Sequence>
bool operator<(const stack<T, Sequence>& x,
                const stack<T, Sequence>& x);

template <class T, class Sequence = deque<T> >
class stack {
    // The following are right
    friend bool operator== <> (const stack&, const stack&);
    friend bool operator< <> (const stack&, const stack&);

    // The follwing are also right
    friend bool operator== <T> (const stack&, const stack&);
    friend bool operator< <T> (const stack&, const stack&);

    // The follwing are also right
    friend bool operator== <T> (const stack<T>&, const stack<T>&);
    friend bool operator< <T> (const stack<T>&, const stack<T>&);

    // But this is wrong
    // friend bool operator== (const stack&, const stack&)
    // friend bool operator< (const stack&, const stack&)
};

int main() {
    stack<int> x;
    stack<int> y;

    cout << (x == y) << endl;
    cout << (x < y) << endl;
}
```

## Allocator
Note the Explicit way to call the `new` operator, including allocate
memory and calling constructor.
```c++
// construction
T* p = operator new(sizeof(T)); // allocate memory
new(p) T;                       // calling constructor
// destruction
p->~T();           // destructor
operator delete(p) // deallocate
```

### SGI Allocator
SGI has the ability of **sub-allocation**

So don't use the standard name:

```c++
vector<int, std::allocator<int> > iv;
```

Write it as:

```c++
vector<int, std::alloc> iv;
```

* `alloc::allocate()`: memory allocation
* `::construct`: constructor
* `alloc::deallocate()`: memory deallocation
* `::destroy`

### `construct()` and `destroy()`
```c++
template<class T>
inline void destroy(T* pointer) {
    pointer->~T();
}
```
