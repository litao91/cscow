# Process Scheduling
Multitasking operating system: one that can simultaneously interleave
execution of more than one process

Two flavors:

* Cooperative multitasking
* Preemptive multitasking (modern os)

**Preemption**: involuntarily suspending a running process.
**Yielding**: The act of a process voluntarily suspending itself.

## Policy
Policy is the behavior of the scheduler that determines what runs when. 

Tow kinds of processes:

* I/O-bounded: most GUI applications are I/O-bounded (wait on user
  interaction). Only runs for short durations.
* Processor-bound: tends to run less frequently but for longer duration. 

Goal: fast process response time (low latency) and maximal system
utilization (high throughput).

### Process Priority
A common type of scheduling algorithm is priority-based scheduling. The
goal is to rank processes based on their worth and need for processor
time.

The Linux Kernel implements two separate priority ranges:
* *nice value*, from -20 to +19, with a default of 0. Larger nice values
  correspond to lower priority -- you are being nice to other processes on
  the system. In Linux, nice value is a control over the *proportion* of
  timeslices.
* *real-time priority*. Default range from 0 to 99, inclusive. All
  real-time processes are at a higher priority than normal process. That
  is, the real-time priority and nice value are in disjoint value sapces. 

### Timeslice
The timeslice is the numerical value that represents how long a task can
run until it is preempted.

Linux's CFS (Completely Fair Scheduler) does not directly assign temeslice
to processes. Instead, CFS assigns processes a *proportion* of the
processor. On Linux, therefore, the amount of processor time that a
process receives is a function of the load of the system. 

The nice value acts as a weight, changing the proportion of the processor
time each process receives. 

### The Scheduling Policy in Action
Consider a system with two running tasks: a text editor (I/O bounded) and a video
encoder (processor bounded).

Ideally: scheduler gives the text editor a larger proportion of the
available processor than the video encoder, because the text editor is
interactive. 

Two goals for the text editor:

1. We want it to have a large amount of processor time available to it. We
   want it to always have processor time available the moment it needs it.
* We want the text editor to preempt the video encoder the moment it wakes
  up.


On most OS, these goals are accomplished by giving the text a higher
priority and larger timeslice than the video encoder. 

Linux achieves these goals by different means. Instead of assigning the
text editor a specific priority and timelice, it guaranttes the text
editor a specific proportion of the processor.

Say, both the processes has proportion of 50%. When the editor wake up,
CFS notes that it is allotted 50% of the processor but has used
considerably less. Specifically, CFS determines that the text editor has
run for less time than the video encoder (because most of the time, the
editor is waiting and encoder is running). Attempting to give all processes
a fair share of the processor, it then preempts the video encoder and
enables the text editor to run. The text editor runs, quickly processes
the user's key press, and again sleeps, waiting for more input.

Continue this manner, CFS always enabling the text to run when it wants
and the video encoder to run the rest of the time.

## The Linux Scheduling Algorithm
### Scheduler Classes
The Linux Scheduler is modular, enabling different algorithms to schedule
different types of processes. This modularity is called *schedular
classes*. Scheduler classes enable different, pluggable algorithms to
coexist, scheduling their own types of processes.

The base scheduler code, which defined in `kerenel/sched.c`, iterates over
each scheduler class in order of priority. The highest priority scheduler
class that has a runnable process wins, selecting who runs next.

The Completely Fair Scheduler(CFS) is the registered scheduler class for
normal processes, called `SCHED_NORMAL` in Linux. CFS is defined in
`kernel/sched_fair.c`

### Process Scheduling in Unix Systems
Process with a higher priority run more frequently and receive higher
timeslice. Problems:

1. Mapping nice values onto timeslice requires a decision about what
   absolute timeslice to allot each nice value. e.g. nice value with
   timeslice of 100 ms and +20 nice vlaue with 5ms. If we run exactly two
   low priority processes, each enjoy the processor of 5 ms at a time. If
   we have two normal priority processes, each again receives 50% of the
   processor, in 100 ms increments. Both of them are *backward* from ideal.
* Relative nice values and again the nice value to timeslice mapping.
  "nicing down a process by one" has wildly different effects depending on
  the starting nice value. 
* If performing a nice value to timeslice mapping, we need the ability to
  assign absolute timeslice. This absolute value must be measured in terms
  the kernel can measure. 
* Handling process wake up in a priority-based scheduler that wants to
  optimize for interactive tasks. 

### Fair Scheduling
CFS uses the nice value to *weight* the proportion of processor a process
is to revieve. 

Each process then runs for a "timeslice" proportional to tis weight
divided by the toal weight of all runnable threads. 

* **target latency**: the target for CFS's approximation of the scheduling
  duration. Smaller targets yields yield better interactivity and a closer
  approximation to perfect multitasking, at the expense of hier switch
  costs and worse throughput. 
* **minimum granularity** a floor on the timeslice assigned to each
  process.

## The Linux Scheduling Implementation
CFS's acutal implementation lives in `kernel/sched_fair.c`. Components of
CFS:

* Time Accounting 
* Process Selection
* The Scheduler Entry Point
* Sleeping and Waking Up

### Time Accounting
Most Unix systems do so, by assigning each process a timeslice. On each
tick of the system clock, the timeslice is decremented by the tick period.

When the timeslice reaches zero, the process is preempted in favor of
another runnable process with a non zero timeslice.

#### The scheduler Entity Structure
CFS uses the *scheduler entity structure*, `struct sched_entity`, defined
in `<linux/sched.h>`, to keep track of process accounting:
    
    struct sched_entity {
        struct load_weight load;
        struct rb_node run_node;
        struct list_head group_node;
        unsigned int on_rq;
        u64 exec_start;
        u64 sum_exec_runtime;
        u64 vruntime;
        u64 prev_sum_exec_runtime;
        u64 last_wakeup;
        u64 avg_overlap;
        u64 nr_migrations;
        u64 start runtime;
        u64 avg_wakeup;
    };

The scheduler entity structure is embedded in the *process-descriptor*,
`struct task_struct`, as a member variable named `se`.

#### The Virtual Runtime
The `vruntime` variable stores the *virtual runtime* of a process, which
is the actual runtime normalized by the number of runnable process.

The virtual runtime's unit is nanoseconds and therefore `vruntime` is
decoupled from the timer tick.

CFS uses `vruntime` to account for how long a process has run and thus how
much longer it ought to run. 

The function `update_curr()`, defined in `kernel/sched_fair.c` manages
this accounting. It will calculates the execution time of the current
process and stores that value in `delta_exec`. It then passes that runtime
to `__update_curr()`, which weights the time by the number of runnable
processes. 

`update_curr()` is invoked periodically by the system timer and also
whenever a process becomes runnable or blocks, becoming unrunnable. 

### Process Selection

Simple rule: When CFS is deciding what process to run next, it picks the
process with the smallest `vruntime`. 

CFS uses a *red-black* to manage the list of **runnable processes** and
efficiently find the process with the smallest `vruntime`. 

It involves:
1. Picking the Next Task: Given the rbtree, the process that CFS wants to
   run next, which is the process with the smallest `vruntime`, is the
   leftmost node in the tree. The function perform this selection is
   `__pick_next_entity()` defined in `kernel/sched_fair.c`. With the
   line`struct rb_node *left = cfs_rq->rb_leftmost;` ( it does not really
   traverse the tree)
* Adding processes to the Tree and caches the leftmost node. This would
  occur when a process becomes runnable(wakes up) or its first created via
  `fork()`. Adding process is performed by `enqueue_entity()`. This
  function updates the runtime and other statistics and then invokes
  `__enqueue_entity()` to perform the actual heavy lifting of inserting
  the entry to rbtree.
* Removing Process from the tree. This happens when a process blocks or
  terminates. With `dequeue_entity()`, and then, the real work is
  performed by the helper function `__dequeue_entity()`.

