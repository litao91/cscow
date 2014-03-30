# Thread




                      4 kB +---------------------------------+
                           |          kernel stack           |
                           |                |                |
                           |                |                |
                           |                V                |
                           |         grows downward          |
                           |                                 |
                           |                                 |
                           |                                 |
                           |                                 |
                           |                                 |
                           |                                 |
                           |                                 |
                           |                                 |
    sizeof (struct thread) +---------------------------------+
                           |              magic              |
                           |                :                |
                           |                :                |
                           |              status             |
                           |               tid               |
                      0 kB +---------------------------------+

---

## `struct thread`
Represent a thread of a user process. 

`struct thread` occupies the beginning of its own page of memory. The rest
is used for thread's stack, grown downward from the end of the page.

Members
* `enum thread_status status`: three states, `THREAD_RUNNING`,
  `THREAD_READY` and `THREAD_BLOCKED`.
* `char name[16]`
* `uint8_t *stack`: every thread has its own stack to keep track of its
  state. When the thread is running, the CPU's stack pointer register
  tracks the top of the stack and this member is used. When CPU switches
  to another thread, this member saves the thread's stack pointer. 
* `int priority`: A thread priority, ranging from `PRI_MIN`(0) to
  `PRI_MAX` (63).
* `struct list_elem allelem`: used to link the thread into a list of all
  threads. The `thread_foreach` function should be used to iterate over
  all threads
* `struct list_elem elem` put thread into doubly linked list, either
  `read_list` or a list of threads waiting on a semaphre in `sema_down()`.
* `uint32_t* pagedir`
* `unsign magic`: always set to `THREAD_MAGIC` which is just an arbitrary
  number defined in `threads/thread.c`, and used to detect stack overflow.

## Thread Functions
`threads/thread.c` implements several public functions:

* `void thread_init(void)`: called by `main()`. Create a `struct thread`
  for Pintos's initial thread. THe Pintos loader puts the initial thread's
  stack at the top of a page, in the same position as any other threads.
* `void thread_start()`: Called by `main()`. Creates the idle thread. The
  thread that is scheduled when no other thread is ready. Then enables
  interrupts.
* `void thread_tick(void)`: called by the timer interrupt at each time
  tick. Keep track of thread statistics and triggers the scheduler when a
  time slice expires.
* `void thread_print_stats(void)`: Called during pintos shutdown.
* `tid_t thread_create (const char *name, int priority, thread_func *func, void *aux)`: 
   creates and starts a new thread named `name` with given `priority`,
   returning the new thread's tid. The thread executes `func`, passing
   `aux` as the function's single argument.
* `void thread_block(void)`: Transitions the running thread from the
  running state to the blocked state.
* `void thread_unblock(struct thread *thread)`
* `struct thread *thread_current(void)`
* `tid_t thread_tid(void)`: return running thread's tid
* `const char *thread_name(void)`
* `void thread_exit(void)`: cause the current thread to exit.
* `void thread_yield(void)`: Yields the CPU to the scheduler, which picks
  anew thread to run. The new thread might be the current, so you can't
  depend on the function to keep this thread from running from any
  particular length of time.
* `void thread_foreach (thread_action_func *action, void *aux)`, the
  `thread_action_func` of the type: `void thread_action_func (struct thread *thread, void *aux)`
* `int thread_get_priority(void)`
* `void thread_set_priority(int new_priority)`


## Thread Switching
`schedule()` is responsible for switching threads. It's internal to
`threads/thread.c` and called only by:

* `thread_block()`
* `thread_exit()`
* `thread_yield()`

`schedule()`:

* records the current thread in local variable `cur`
* Determine next thread by calling `next_thread_to_run()` and store in
  local variable `next`
* Call `switch_threads()` to do the actual thread switch.
* The thread we switch to was also running inside `switch_threads()`

---

`switch_threads()` is an assembly language routine in `threads/switch.S`.

1. It saves registers on the stack
* Saves the CPU's current stack pointer in the current `struct thread`'s
  stack member.
* Register the new thread's stack into the CPU's stack pointer
* restores registers from the stack
* return

The resst of the scheduler is implemented in `thread_schedule_tail()`.

* It marks the new thread as running
* If the thread was just switched from the dying state, then it also frees
  the page that contained the dying thread's `struct thread` and stack. 
  These couldn't be freed prior tot eh thread switch because the switch 
  needed to use it. 

When `thread_create()` creates a new thread, the new thread hasn't started
running yet, so there's no way for it to be running inside 
`switch_threads()` as scheduler expects. `thread_create()` creates some 
fake stack frames:

* The topmost fake stack frame is for `switch_threads()`, represented by
  `strcut switch_threads_frame`.
* The next is for `switch_entry()` (in `threads/switch.S`) that adjusts 
  the stack pointer, calls `thread_schedule_tail()` and returns. We fill
  in its stack frame so that it returns into `kernel_thread()`.
* The final stack frame is for `kernel_thread()`, enables interrupts and 
  calls the thread's function. 

## Synchronization
### Semaphores
Two operations:

* "Down" or "P": wait for the value to become position, then decrement it
* "Up" or "V": increment the value and wake up one waiting thread if any.

A semaphore initialized to 0 may be used to wait for an event that will
happen exactly once. For example, suppose thread A starts another thread B
and wants to wait for B to signal that some activity is complete. A can
create a semaphore initialized to 0, pass it to B as it starts it, and
then "down" the semaphore. When B finishes its activity, it "ups" the
semaphore. This works regardless of whether A "downs" the semaphore or B
"ups" it first.

A semaphore initialized to 1 is typically used for controlling access to a
resource. Before a block of code starts using the resource, it "downs" the
semaphore, then after it is done with the resource it "ups" the resource.
In such a case a lock, described below, may be more appropriate.


Semaphores can also be initialized to values larger than 1. These are
rarely used.

Semaphores are internally built out of disabling interrupt and thread
blocking and unblocking

### Locks
A `lock` is like a semaphore with an initial value of 1.

"release" equal to "up" and "acquire" equal to "down"

### Monitors
Consists of:

* Data being synchronized
* A lock called the *monitor lock*
* One or more *condition variables*

How it works:

* Before it access the protected data, a thread first acquires the
  monitor lock, then said to be "in the monitor".
* While in the monitor, when access to the protected data is completed, it
  releases the monitor lock
* Conditional variables allow code in the monitor to wait for a condition
  to become true. Each condition variable is associated with an abstract
  condition.
* When code in the monitor need to wait for a condition to become true, it
  "waits" on the associated condition variable, which releases the lock
  and waits for the condition to be signaled.

Monitor example:

```c
char buf[BUF_SIZE];     /* Buffer. */
size_t n = 0;           /* 0 <= n <= BUF_SIZE: # of characters in buffer. */
size_t head = 0;        /* buf index of next char to write (mod BUF_SIZE). */
size_t tail = 0;        /* buf index of next char to read (mod BUF_SIZE). */
struct lock lock;       /* Monitor lock. */
struct condition not_empty; /* Signaled when the buffer is not empty. */
struct condition not_full; /* Signaled when the buffer is not full. */

...initialize the locks and condition variables...

void put (char ch) {
  lock_acquire (&lock);
  while (n == BUF_SIZE)            /* Can't add to buf as long as it's full. */
    cond_wait (&not_full, &lock);
  buf[head++ % BUF_SIZE] = ch;     /* Add ch to buf. */
  n++;
  cond_signal (&not_empty, &lock); /* buf can't be empty anymore. */
  lock_release (&lock);
}

char get (void) {
  char ch;
  lock_acquire (&lock);
  while (n == 0)                  /* Can't read buf as long as it's empty. */
    cond_wait (&not_empty, &lock);
  ch = buf[tail++ % BUF_SIZE];    /* Get ch from buf. */
  n--;
  cond_signal (&not_full, &lock); /* buf can't be full anymore. */
  lock_release (&lock);
}
```

## Optimization Barriers
An optimization barrier is a special statement that prevents teh compiler
from making assumptions about the state of memory accross the barrier.
