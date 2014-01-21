# Introduction to Kernel Synchronization
## Locking
Consider a race condition:

* You have a queue of request in a linked list.
* Two function manipulate the queue
    - one function adds a new request to the tail of the queue
    - Another function removes a request from the head of the queue and
      does something useful with the request.
* Requests are continually being added, removed and serviced in various
  part of the kernel.
* If one thread attempts to read from the queue while the another is in
  the middle of manipulating it, the reading thread will find the queue in
  an inconsistent state. 
* The sort of damage that could occur if access to the queue could occur
  concurrently.

Often, when the shared resource is a complex data structure, the result
of a race condition is corruption of the data structure.

A single *lock* could have been used to protect the queue.

* Whenever there was a new request to add to the queue, the thread would
  first obtain the lock. 
* Then it safely add the request to the queue and ultimately release the
  lock.
* When a thread wanted to remove a request from the queue, it too would
  obtain the lock.

Notice that locks are *advisory* and *voluntary*. Locks are entirely a
programming construct that the programmer must take advantage of.

Locks are implemented using atomic operations that ensures no race exists.
How this is done is architecture-specific, but almost all processors
implement an atomic *test* and *set* instruction that tests the value of
an integer and sets it to a new value only if it is zero.A value of zero
means unlocked. On x86, locks are implemented using *compare* and
*exchange*.

### Causes of Concurrency
