#Iterator and Traits
## Trains
For general iterator

```c++
template <class T>
struct iterator_traits {
    typedef typename I::value_type
};
```

Partial Specialization for pointer:

```c++
template<class T>
struct iterator_traits<T*> {
    typedef T value_type;
};
```

Partial Specialization for const

```c++
template<class T>
struct iterator_traits<const T*> {
    typedef T value_type;
};
```

