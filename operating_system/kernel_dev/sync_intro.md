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
In user-space, the need for synchronization stems from the fact that
programs are scheduled preemptively at the will of the scheduler.

A process can be preempted in the middle of accessing a critical region.
If the newly scheduled process then enters the same critical region, a
race condition occur. This type of concurrency, in which two things do not
actually happen at the same time but interleave with each other, is called
*pseudo-concurrency*

If you have a symmetrical multiprocessing machine, two process can
actually be executed in critical region at the exact same time. That is
called *true concurrency*.

The kernel has similar causes of concurrency:

* Interrupts
* Softirqs and tasklets
* Kernel preemption
* Sleeping and synchronization with user-space
* Symmetrical multiprocessing

Implementing the actual locking in your code to protect shared data is not
difficult, especially when done early on during the design phase of
development. The tricky part is identifying the actual shared data dn the
corresponding critical region. 

* *interrupt-safe* code that is safe from concurrent access from an
  interrupt handler
* *SMP-safe* code that is safe from concurrency on symmetrical
  multiprocessing machine.
* *preempt-safe* code that is safe from concurrency with kernel
  preemption.

Any data that can be accessed concurrently almost assuredly needs
protection. Most global kernel data structures need lock.

## Deadlocks
A *deadlock* is a condition involving one or more threads of execution and
one or more resources, such that each thread waits for one of the
resources, but all the resources are already held. 

The threads are all wait for each other. 

* Self-deadlock: a thread of execution attempts to acquire a lock it
  already holds.
* Consider n threads and n locks. If each thread holds a lock taht the
  other thread wants, all threads block while waiting for their respective
  locks to become available. The most common example is two threads and
  two locks, which is often called *deadly embrace* or the ABBA deadlock.

Thread 1:
    
    acquire lock A
    try to acquire lock B
    wait for lock B

Thread 2:

    acquire lock B
    try to acquire lock A
    wait for lock A

Each thread is waiting for the other, and neither thread will ever release
its original lock; therefore, neither lock will become available.

Few simple rule to avoid deadlock:

* Implement lock ordering. Nested locks must *always* be obtained in the
  same order. This prevents the deadly embrace deadlock. 
* Prevent starvation
* Do not double acquire the same lock

The first point is most important and worth stressing. **If two or more
locks are acquired at the same time, they must always be acquired in the
same order**

## Contention and Scalability
The term *lock contention* or simply *contention*, describes a lock
currently in use but that another thread is trying to acquire. A lock that
is *highly contended* often has threads waiting to acquire it. 

* *Scalability* is a measurement of how well a system can be expanded. In
  OS, we talk of the scalability with a large number of processes
* The granularity of locking is a description of the size or amount of
  data that a lock protects. A very coarse lock protects a large amount of
  data. A very fine-grained lock protects a small amount of data.

Start simple and grow in complexity only as needed. Simplicity is key.
