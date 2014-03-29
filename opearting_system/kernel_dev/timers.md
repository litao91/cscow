# Timers and Time Management
The hardware provides a system timer that the kernel uses to gauge the
passing of time. 

The system timer goes off at a preprogrammed frequency, called *tick
rate*. The period is called a *tick* and is equal to `1/tick_rate`
seconds.

The kernel defines the value in `<asm/param.h>`. The tick rate has a
frequency of `HZ` hertz and a period of `1/HZ` second.

The global variable `jiffies` holds the number of ticks that have occurred
since the system boot. On boot, the kernel initializes the variable to
zero, and it is incremented by one during each timer interrupt. The system
uptime is therefore `jiffies/HZ` seconds.

What actually happens is slightly more complicated: The kernel initializes
`jiffies` to a special initial value, causing the variable to overflow
more often, catching bugs.

The `jiffies` variable is declared in `<linux/jiffies.h>` as

    extern unsigned long volatile jiffies;

* Seconds to a unit of `jiffies`:
    
        (seconds * HZ)

* `jiffies` to seconds:

        (jiffies / HZ)

## Internal Representation of Jiffies
With a tick rate of 100, a 32-bit `jiffies` variable would overflow in
about 497 days. With `HZ` increased to 1000, however, that overflow now
occurs in just 49.7 days. 

`jiffies` is defined as an unsigned long:

    extern unsigned long volatile jiffies;

A second variable is also defined in `<linux/jiffies.h>`:

    extern u64 jiffies_64;

The `ld(1)` script used to link the main kernel image
(`arch/x86/kernel/vmlinux.lds.s` on x86) then *overlays* the `jiffies`
variable over the start of the `jiffies_64` variable:

    `jiffies = jiffies_64;

Thus `jiffies` is the lower 32 bits of the full 64bit `jiffies_64`
variable.

Most code cares about only the lower 32 bits, the time management code
uses the entire 64 bits, however, and thus prevents overflow of the full
64-bit value.

Code that access `jiffies` simply reads the lower 32 bits of `jiffies_64`.
The function `get_jiffies_64()` can be used to read the full 64-bit value.

## Jiffies Wraparound
The `jiffies`, for 32 bit unsigned integer, the max value is `2^32-1`.
When the tick count is equal to this maximum and it is incremented, it
wraps around to zero.

An example of a wrap around:

    unsigned long timeout = jiffies + HZ/2; /* timeout in 0.5s */

    /* do some work */

    /*  then see whether we took too long */
    if (timeout > jiffies) {
        /* we did not time out, good */
    } else {
        /* we timed out, error */
    }

Multiple potential overflow issues are here. Consider what happens if
`jiffies` wrapped back to zero after setting `timeout.`

Thankfully, the kernel provides four macros for comparing tick counts that
correctly handle wraparound in the tick count. They are in
`<linux/jiffies.h>` listed here are simplified version of the macros

    #define time_after(unknown, known) ((long)(known) - (long)(unknown) < 0) 
    #define time_before(unknown, known) ((long)(unknown) - (long)(known) < 0) 
    #define time_after_eq(unknown, known) ((long)(unknown) - (long)(known) >= 0) 
    #define time_before_eq(unknown, known) ((long)(known) - (long)(unknown) >= 0)

The `unknown` parameter is typically `jiffies` and the `known` is the
value against which you want to compare.

## Hardware Clocks and Timers
Two hardware devices to help with time keeping:
* **Real-Time Clock**: The real-time clock (RTC) provides a nonvolatile
  device for storing the system time. On boot, the kernel reads the RTC
  and uses it to initialize the wall time, which is stored in the `xtime`
  variable.
* **System Timer**:To provide a mechanism for driving an interrupt at
  periodic rate.

## The Timer Interrupt Handler
The architecture-dependent routine is registered as the interrupt handler
for the system timer and runs when the timer interrupt hits. Most handlers
perform at least the following work:

* Obtain `xtime_lock`, which protects `jiffies_64` and `xtime`.
* Acknowledge or reset the system timer as required.
* Periodically save and updated wall time to the real time clock.
* Call the architecture-independent timer routine, `tick_periodic()`

The architecture-independent `tick_periodic()` perform much more work:

* Increase `jiffies_64` count by 1
* Update resource usage for currently running process (consumed system and
  user time.
* Run any dynamic timers that have expired.
* Execute `scheduler_tick()`
* Update wall time that stored in `xtime`.
* Calculate the load average.

The routine:

    static void tick_periodic(int cpu) {
        if (tick_do_timer_cpu == cpu) {
            write_seqlock(&xtime_lock);

            /* Keep track of the next tick event */
            tick_next_period = ktime_add(tick_next_period, tick_period);

            do_timer(1);

            write_sequnlock(&xtime_lock);
        }

        update_process_times(user_mode(get_irq_regs()));
        profile_tick(CPU_PROFILING);
    }

    void do_timer(unsigned long ticks) {
        jiffies_64 += ticks;
        update_wall_time();
        calc_global_load(); // update load average
    }

    update_process_timers(int user_tick) {
        struct task_struct *p = current;
        int cpu = smp_processor_id();

        /* Note: this timer irq context must be accounted for as well. */
        account_process_tick(p, user_tick);
        run_local_timers();
        printk_tick();
        rcu_check_callbacks(cpu, user_tick);
        scheduler_tick();
        run_posix_cpu_timers(p);
    }


    // actual updating of the process's times:
    void account_process_tick(struct task_struct *p, int user_tick) 
    {
        cputime_t one_jiffy_scaled = cputime_to_scaled(cputime_one_jiffy); 
        struct rq *rq = this_rq();
        if (user_tick) 
            account_user_time(p, cputime_one_jiffy, one_jiffy_scaled);
        else if ((p != rq->idle) || (irq_count() != HARDIRQ_OFFSET)) 
            account_system_time(p, HARDIRQ_OFFSET, cputime_one_jiffy,
                                one_jiffy_scaled);
        else
            account_idle_time(cputime_one_jiffy);
    }

Notes: 

* This approach implies that the kernel credits a process for running the
  *entire* previous tick in whatever mode the processor was in when the
  timer interrupt occurred.
* The `run_locak_timers()` function marks a softirq to handler the
  execution of any expired timers.
* `scheduler_tick()` function decrements the currently running process's
  timeslice and sets the `need_resched` if needed.

## The Time of day:

The wall time is defined in `kernel/time/timekeeping.c`:

    struct timespec xtime;

The `timespec` data structure is defined in `<linux/time.h>` as:

    struct timespec {
        __kernel_time_t tv_sec; /* seconds since 1970-1-1 */
        long tv_nsec;           /* nanoseconds */
    };

To update `xtime` a write seqlock is required:
    
    write_seqlock(&xtime_lock);

    /* update xtime ... */

    write_sequnlock(&xtime_lock);


## Timers
*Timers* -- sometimes called *dynamic timers* or *kernel timers* are
essential for managing the flow of time in kernel code. Used to delay work
a specified amount of time -- certainly no less, and with hope, not much
longer.

### Using Timers
Timers are represented by `struct timer_list` which is defined in
`<linux/timer.h>`

    struct timer_list { 
        struct list_head entry; /* entry in linked list of timers */ 
        unsigned long expires; /* expiration value, in jiffies */ 
        void (*function)(unsigned long); /* the timer handler function */ 
        unsigned long data; /* lone argument to the handler */ 
        struct tvec_t_base_s *base; /* internal timer field, do not touch */
    };

Most of the actual implementation is in `kernel/timer.c`. 

The first step in creating a timer is defining it:

    struct timer_list my_timer;

Initialize internal values:

    init_timer(&my_timer);

Fill out the remaining as required;
    
    my_timer.expires = jiffies + delay;
    my_timer.data = 0; /* zero is passed to the timer handler
    my_timer.function = my_function; /* function to run when timer expires */

The function must match this prototype:

    void my_timer_function(unsigned long data);

Finally you activate the timer:

    add_timer(&my_timer);

Note the significance of the `expired` value. The kernel runs the timer
handler when the current tick count is *equal to or greate than* the
specified expiration. Although the kernel guarantees to run no tmier
handler *prior* to the timer's expiration, there may be a delay in running
the timer. Consequently, **timers cannot be used to implement any sort of
hard real-time processing**.

Modify the expiration of an already active timer:

    mod_timer(&my_timer, jiffies + new_delay); /* new expiration */

If you need to deactivate a timer prior to its expiration:
    
    del_timer(&my_timer);

A potential race condition that must be guarded against exists when
deleting timers. When `del_timer()` returns, it guarantee that the timer
is no longer active. On a multiprocessing machine, the timer handler might
already be executing on another processor. 

To deactivate the timer and wait until a potentially executing handler for
the timer exits, use `del_timer_sync()`:

    del_timer_sync(&my_timer);
