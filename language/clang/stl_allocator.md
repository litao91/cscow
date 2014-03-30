# STL
## Some C++ syntax
### Static Template Member
```cpp
template<typename T>
class testClass {
public:
    static int _data;
};

int testClass<int>::_data = 1;
int testClass<char>::_data = 2;
```

### Member Templates
```cpp
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

```cpp
template <class T, class Sequence = deque<T> >
class stack {
public:
    stack() {cout << "stack" << endl; }
private:
    Sequence c;
};
```

### Null Template Args

```cpp
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
```cpp
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

```cpp
vector<int, std::allocator<int> > iv;
```

Write it as:

```cpp
vector<int, std::alloc> iv;
```

* `alloc::allocate()`: memory allocation
* `::construct`: constructor
* `alloc::deallocate()`: memory deallocation
* `::destroy`

### `construct()` and `destroy()`
```cpp
template<class T>
inline void construct(T1* p, const T2& value) {
    new (p) T1(value); // explicitly call constructor
}

template<class T>
inline void destroy(T* pointer) {
    pointer->~T();
}

```

### Usage of allocate
Explicitly calling `new` and `delete` operator.

```cpp
template <class T>
inline T* _allocate(ptrdiff_t size, T*) {
    T* tmp = (T*) (::operator new((size_t)(size * sizeof(T)));
}

template <classs T>
inline void _deallocate(T* buffer) {
    ::operator delete(buffer);
}
```

### The Second Level allocator
Basically maintains a free list to avoid fragmentation.

Some notes:

* There are several free lists, they work as a hash map for the free
  blocks. 
* To find a free block is to find the hash set.

```cpp
enum {__ALIGN = 8};
enum {__MAX_BYTES = 128};
enum {__NFREELISTS = __MAX_BYTES/__ALIGN}; // number of free-lists

template<bool threads, int inst>
class __default_alloc_template {
private:
// ROUND_UP, increase the bytes to multiple of 8
static size_t ROUND_UP(size_t bytes) {
    return (((bytes) + __ALIGN - 1) & ~(__ALIGN - 1));
}
private:
// To save memory, save data if it has data, point to next free node 
// if it is free. Very smart design!!!
union obj { // the node for free lists
    union obj * free_list_link; 
    char client_data[1]; 
}
private:
// 16 free-lists
static obj * volatile free_list[__NFREELISTS];
static size_t FREELIST_INDEX(size_t bytes) {
    return (((bytes) + __ALIGN - 1)/__ALIGN - 1);
}

// return a object with size n, and add to the free-list
static void *refill(size_t n);
// allocate a spzce of size size * nobjs
static char *chunk_alloc(size_t size, int &nobjs);

// Chunk allocation state
static char *start_free; // the start of memory pool
static char *end_free; // then end of memory pool
static size_t heap_size;

public:
static void* allocate(size_t n) {
    obj *volatile *my_free_list;
    obj *result;
    // call the first level allocator if small enough
    if(n > (size_t) __MAX_BYTES) {
        return (malloc_alloc::allocate(n));
    }
    // currently point to the head of the list, 
    // note that the thing it points to is also a 
    // pointer
    my_free_list = free_list + FREELIST_INDEX(n);
    result = *my_free_list;
    if(result == 0) {
        void *r = refill(ROUND_UP(n));
        return r;
    }
    // change the head of the linked-list
    *my_free_list = result -> free_list_link;
    return (result);
}

static void* deallocate(void *p, size_t n) {
    obj *q = (obj *)p;
    obj * volatile * my_free_list;
    if(n > (size_t) __MAX_BYTES) {
        malloc_alloc::deallocate(p, n);
        return;
    }
    my_free_list = free_list + FREELIST_INDEX(n);
    q -> free_list_link = *my_free_list; // insert q to the head
    *my_free_list = q;
}
static void * reallocate(void *p, size_t old_sz, size_t new_sz);
};
```

#### The refill function
* When it finds that there is no free space in `free_list`, it will call
  `refill()`
* New spaces are get from memory pool by calling `chunk_alloc()`

```cpp
// return an object of size n
template<bool threads, int inst>
void* __default_alloc_template<threads, inst>::refill(size_t n) {
    int nojbs = 20; // number of objects
    // get the number of objects specified in nobjs
    char* chuck = chunk_alloc(n, nobjs);
    obj * volatile *my_free_list;
    obj * result;
    obj * current_obj, * next_obj;
    if(1 == nobjs) return(chunk); // if only one get, use it

    // fill the extra objects to the free list
    my_free_list = free_list + FREELIST_INDEX(n);

    // create free_list inside the chuck
    result = (obj *)chunk; //this block is for client

    // directing the free_list to point to new spaces
    *my_free_list = next_obj = (obj *) (chunk + n);
    for (i=1; ; i++) {
        current_obj = next_obj;
        next_obj = (obj *) ((char *)next_obj + n);
        if(nobjs - 1 == i) {
            current_obj -> free_list_link = 0;
        } else {
            current_obj -> free_list_link = next_obj;
        }
    }
    return (result);
}
```

The memory pool

```cpp
template<bool threads, int inst>
__default_alloc_template<threads, inst>::
chunk_alloc(size_t size, int& nobjs) {
    char * result;
    size_t total_bytes = size * nobjs;
    sizet_t bytes_left = end_free - start_free;
    if(bytes_left >= total) {
        // enough space, directly return
        result = start_free;
        start_free += total_bytes;
        return (result);
    } else if (bytes_left >= size) {
        nobjs = bytes_left/size;
        total_bytes = size * nobjs;
        result = start_free;
        start_free+= total_bytes;
        return (result);
    } else {
        size_t bytes_to_get = total_bytes + ROUND_UP(heap_size >> 4);

        if(bytes_left > 0) {
        //make use of the left bytes
            obj* volatile * my_free_list = free_list + FREELIST_INDEX(bytes_left);
            ((obj *)start_free) -> free_list_link = *my_free_list;
        }

        start_free = (char *)malloc(bytes_to_get);
        if(0 == start_free) {
            // deal with malloc fail, ignore here
        }
        heap_size += bytes_to_get;
        end_free = start_free + bytes_to_get;
        //how has enough space, recursively call itself
        return(chunk_alloc(size, nobjs));
    }
}

```
