# BSD Scheduler (Multilevel feedback queue scheduler)
The goal of a general-purpose scheduler: balance thread's different
scheduling needs. 
* Threads that perform a lot of I/O require a fast response time to keep
  input and output devices busy, but little CPU time.
* Compute-bound threads need to receive a lot of CPU time to finish their
  work, but have no requirement for fast response time.
* Other threads lie somewhere in between.

A example of *multilevel feedback queue* scheduler:
* Maintains several queues of ready-to-run threads, each queue holds
  threads with a different priority. 
* At any given time, the scheduler chooses a thread from the
  highest-priority non-empty queue. 
* If the highest priority queue contains multiple threads, then they run
  in "round robin" order.


Multiple facets of the scheduler require data to be updated after certain
number of timer ticks.  In every case, these updates should occur before
any ordinary kernel thread has a chance to run, so that there is no chance
that a kernel thread could see newly increased `timer_ticks()`.

## Niceness
Each thread has an integer nice value that determines how "nice" the thrad
should be to other threads.

* Nice zero does not affect thread priority. 
* A positive nice, to the maximum of 20, decreases the priority of a
  thread and causes it to *give up some CPU time*
* A negative nice, to minimum of -20, tends to take away CPU time from
  other threads.

Function to implement in `threads/thread.c`
```c
int thread_get_nice(void);
// set the current thread's nice val to new_nice and recalculates the
//thread's priority.
void thread_set_nice(int new_nice);
```

## Calculating Priority
* 64 priorities and thus 64 ready queues.
* Thread priority is calculated initially at thread initialization. 
* It is also recalculated once every fourth clock tick, for every thread.

It is determined by the formula:

    priority = PRI_MAX - (recent_cpu  / 4) - (nice * 2)

Where `recent_cpu` is an estimate of the CPU time the thread has used
recently.

## Calculating recent cpu
We wish `recent_cpu` to measure how much CPU time each process has
received "recently". 

