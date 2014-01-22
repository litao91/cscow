# Kernel Synchronization Methods
## Atomic Operations
### Atomic Integer Operations
The atomic integer methods operate on a special data type, `atomic_t`.
This special type is used, as opposed to having the functions work
directly on the C int type.

* Ensures that the atomic operations are used only with these special
  types.
* Ensures that the data types are not passed to any nonatomic function. 
* The use of `atomic_t` ensures the compiler does not optimize access the
  value

The `atomic_t` type is defined in `<linux/types.h>`:

    typedef struct {
        volatile int counter;
    } atomic_t;

Defining an `atomic_t` is done in the usual manner.
    
    atomic_t v; /* define v */
    atomic_t u = ATOMIC_INIT(0); /* define u and initialize it to zero */

Operations:

    atomic_set(&v, 4); /* v = 4 (atomically) */
    atomic_add(2, &v); /* v = v + 2 = 6 (atomically) */
    atomic_inc(&v);    /* v = v + 1 = 7 (atomically) */

Convert it into a int:
    
    printk("%d\n", atomic_read(&v)); // will print 7

A common use of the atomic integer operation is to implement counters.
Use `atomic_inc()` and `atomic_dec()`.

Another use of the atomic integer operators is atomically performing an
operation and testing the result. A common example is the atomic decrement
and test:

    int atomic_dec_and_test(atomic_t* v)

This function decrements by one the given atomic value. If the result is
zero, it returns true.

### 64-Bit Atomic Operations

    typedef struct {
        volatile long counter;
    } atomic64_t
    ATOMIC64_INIT(long i)
    long atomic64_read(atomic64_t *v)
    ...


### Atomic Bitwise Operations
They are architecture-specific and defined in `<asm/bitops.h>`.

The bitwise functions operate on generic memory addresses. The arguments
are pointer and a bit number. Bit zero is the least significant bit of the
given address. On 32-bit machines, bit 31 is the most significant bit, and
bit 32 is the least significant bit of the following world. 

    set_bit(0, &word); /* bit zero is now set (atomically) */ 
    set_bit(1, &word); /* bit one is now set (atomically) */ 
    printk(“%ul\n”, word); /* will print “3” */ 
    clear_bit(1, &word); /* bit one is now unset (atomically) */ 
    change_bit(0, &word); /* bit zero is flipped; now it is unset (atomically) */

## Spin Locks
The most common lock in the Linux kernel is the *spin lock*. A spin lock
is a lock that can be held by at most one thread of execution. If a thread
of execution attempts to acquire a spin lock while it is already held,
which is called *contended*, the thread busy loops -- spins -- waiting for
the lock to become available. 

The fact that a contended spin lock causes threads to spin (essentially
wasting processor time) while waiting for the lock to become available is
salient. This behavior is the point of the spin lock. It is not wise to
hold a spin lock for a long time.

This is the nature of a spin lock: A lightweight single-holder lock that
should be held for short durations. 

An alternative behavior when the lock is contended is to put the current
thread to sleep and wake it up when it becomes available. 

This incurs a bit of overhead -- most notably the two context switches
required to switch out of the back into the blocking thread, which is
certainly a lot more code that the handful of lines used to implement a
spin lock.Therefore, it is wise to hold spin locks for less than the
duration of two context switches

## Spin Lock Methods
