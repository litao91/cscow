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
Spin locks are architecture-dependent and implemented in assembly. The
architecture-dependent code is defined in `<asm/spinlock>`. The actual
usable interfaces are defined in `<linux/spinlock.h>`

The basic use of spin lock:

    DEFINE_SPINLOCK(mr_lock);
    spin_lock(&mr_lock);
    /* critical region... */
    spin_unlock(&mr_lock);

Only one thread is allowed in the critical region at time.

On uni-processor machines, the locks compile away and do not exist; they
they simply act as **markers to disable and enable kernel preemption**. If
kernel preempt is turned off, the locks compile away entirely.

Note: The Linux kernel's spin locks are not recursive. This mean that if
you attempt to acquire a lock you already hold, you will spin, waiting for
yourself to release the lock. But because you are busy spinning, you will
never release the lock and you will deadlock.

Spin lock can be used in interrupt handlers, whereas semaphores cannot be
used because they sleep. 

If a lock is used in an interrupt handler, you must also disable local
interrupts (interrupt requests on the current processor) before obtaining
the lock. 

Otherwise, it is possible for an interrupt handler to interrupt
kernel code while the lock is held and attempt to reacquire the lock. 

* The interrupt handler spins, waiting for the lock to become available.
* The lock holder, does not run until the interrupt handler completes.

This is an example of double-acquire deadlock.

You need to disable interrupts only on the *current* processor. If an
interrupt occurs on a different processor, and it spins on the same lock,
it does not prevent the lock holder (in the processor) from eventually
releasing the lock. 

The kernel provides an interface that conveniently disables interrupts and
acquires the lock, usage:

    DEFINE_SPINLOCK(mr_lock);
    unsigned long flags;

    spin_lock_irqsave(&mr_lock, flags);
    /* critical region... */
    spin_unlock_irqrestore(&mr_lock, flags);

The routine `spin_lock_irqsave()` saves the current sate of interrupts,
disables them locally, and then obtain the given lock. 

On *uniprocessor* systems, the previous example must still disable
interrupts to prevent an interrupt handler from accessing the shared data,
but the lock mechanism is compiled away.

**Big Fact Rule**: Lock data, not code. It is actual data inside that
needs protection and not the code. Rather than lock code, always associate
your shared data with a specific lock. For example, the `struct foo` is
locked by `foo_lock`. 

If you always know interrupt are initially enabled, there is no need to
restore their previous state:
    
    DEFINE_SPINLOCK(mr_lock);
    
    spin_lock_irk(&mr_lock);
    spin_unlock_irq(&mr_lock);


## Reader-Writer Spin Locks
When the list is updated (written to), it is important that no other
threads of execution concurrently write to or read from the list. On the
other hand, when the list is searched (read from), it is only important
that nothing else writes to the list. Multiple concurrent readers are safe
so long as there are no writers. A *reader-writer spin lock* protects the
task list.

Usage is similar to spin locks. Initialized via:
    
    DEFINE_RWLOCK(mr_rwlock);

Then in the reader code:
    
    read_lock(&mr_rwlock);
    /* critical section (read only) */
    write_unlock(&mr_lock);

Note that you cannot upgrade a read lock to a write lock:

    read_lock(&mr_rwlock);
    write_lock(&mr_rwlock);

Executing these two functions are shown will deadlock.

It is safe for multiple readers to obtain the same lock, it is safe for
the same thread to recursively obtain the same read lock. 

Linux reader-writer spin locks favor readers over writers. If the read
lock is held and a writer is waiting for exclusive access, readers that
attempt to acquire the lock continue to succeed. 

A generic reader-writer lock implementation:

    semaphore wrt=1, mutex=1;
    readcount=0;
     
    writer()
    {
        wait(wrt);
        // Writing is done
        signal(wrt);
    }
     
    reader()
    {
        wait(mutex);
        // reader's mutex is basically protecting the data readcount
        readcount++;
        if (readcount == 1)
            wait(wrt);
        signal(mutex);
        // Do the Reading
        // (Critical Section Area)
        wait(mutex);
        readcount--;
        if (readcount == 0)
            signal(wrt);
        signal(mutex);
    }

## Semaphores
Semaphores in Linux are sleeping locks. When a task attempts to acquire a
semaphore that is unavailable, the semaphore places the task onto a wait
queue and puts the task to sleep. The processor is then free to execute
other code. 

When the semaphore becomes available, one of the tasks on the wait queue
is awakened so that it can then acquire the semaphore.

* Semaphores are well suited to locks that are held for a long time.
* Semaphores are not optimal for locks that are held for short periods
  because the overhead can easily outweigh the total lock hold time.
* Semaphores must be obtained only in process context because interrupt
  context is not schedulable.
* You can sleep while holding a semaphore because you will not deadlock
  when another process acquires the same semaphore. It will just go to
  sleep and eventually let you continue.
* You cannot hold a spin lock while you acquire a semaphore, because you
  might have to sleep while waiting for the semaphore, and you cannot
  sleep while holding a spin lock.

A semaphore supports two atomic operation, `P()` (test) and
`V()`(increment). Later system called these methods `down()` and `up()`
respectively, and so does linux. 

* `down()`: acquire a semaphore by decrementing the count by one. If the
  new count is zero or greater, the lock is acquired and the task can
  enter the critical region. If the count is negative, the task is placed
  on a wait queue. 
* `up()`: used to release a semaphore upon completion of a critical
  region. 

### Creating and Initializing Semaphores
The semaphore implementation is defined in `<asm/smaphore.h>`. The `struct
semaphore` type represents semaphores.

    struct semaphore name;
    sema_init(&name, count);

Shortcut to create more common mutex:

    static DECORE_MUTEX(name);

To initialize a dynamically created mutex, you can use:

    init_MUTEX(sem);
