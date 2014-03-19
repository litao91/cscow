# List
## The iterator
```c++
template<class T, class Ref, class Ptr>
struct __list_terator {
    typedef __list_iterator<T, T&, T*> iterator;
    typedef __list_iterator<T, Ref, Ptr> self;

    typedef bidirectional_iterator_tag iterator_category;
    typedef T value_type;
    typdef Ptr pointer;
    typedef Ref reference;
    typedef __list_node<T>* link_type;
    typedef size_t size_type;
    typedef ptrdiff_t difference_type;

    link_type node;

    //constructor
    __list_iterator(link_type) : node(x) {}
    __list_iterator() {}
    __list_iterator(const iterator& x) : node(x.node) {}

    bool operator==(const self& x) const { return node == x.node; }
    bool operator!=(const self& x) const { return node != x.node; }

    reference operator*() const { return (*node).data; }

    pointer operator->() const {return &(operator*()); }
    self& operator++() {
        node = (link_type) ((*node).next);
        return *this;
    }

    self operator++(int) {
        self temp = *this;
        ++*this;
        return tmp;
    }
}
```

## The data structure
```c++
template <class T, class Alloc = alloc>
class list{
protected:
typedef __list_node<T> list_node;
public:
typedef list_node* link_type;

protected:
link_type node;
public:
iterator begin() {return (link_type((*node).next);}
iterator end() {return node; }
bool empty() const {return node->next == node; }
size_type size() const {
    size_type result = 0;
    distance(begin(), end(), result);
    return result;
}
};
```

## Some operations

```c++
// move the data in [first, last) before position
void transfer(iterator position, iterator first, iterator last) {
    if (position != last) {
        (*(link_type((*last.node).prev))).next = position.node; 
        (*link_type((*first.node).prev))).next = last.node;
        (*(link_type((*position.node).prev))).next = first.node;
        link_type tmp = link_type((*position.node).prev);
        (*position.node).prev = (*last.node).prev;
        (*last.node).prev = (*first.node).prev;
        (*first.node).prev = tmp;
    }
}
```
Steps:

1. Link the last's prev to position, note that last itself won't move.
* Link the prev of first to the last (cut the [first, last) off)
* link position's prev to the first (hook the [first, last) up)
* link position's prev to last's prev (last's preve is actually the last node to be moved)
* link last's prev to first's prev (relink the cut part)
* link the first node to the new prev
