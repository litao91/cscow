# Process Management
A *process* is a program in the midst of execution, which program clde is
called *text section* in linux. (active program + related resources)

Threads of execution, often shortened to be *threads*, are the objects of
activity within the process. 

Each thread includes:
* A unique program counter
* process stack
* a set of processor registers

Two virtualizations:
* virtualized processor: give process the illusion that it alone
  monopolizes the system.
* virtualized memory: lets the process allocate and manage memory as if it
  alone owned all the memory in the system.

## Process Descriptor and Task Structure
Kernel stores the list of processes in a circular double linked list
called `task_list`, each element is a *process descriptor* of type `struct
task_struct` (`<linx/sched.h>`)

It contains:
* open files
* process's address space
* pending signals
* process's state
* and much more, as shown in the figure

![](./task_list.png)


### Allocating the Process Descriptor
The `task struct` is allocated via the *slab allocator* to provide object
reuse and cache coloring. Prior to 2.6 kernel, `struct task_struct` was stored at the end of the
kernel stack of each process. With the process descriptor now dynamically
created via the slab allocator, a new structure `struct thread_info` was
created that again lives at the bottom of the stack (for stacks that grow
down) and at the top of the stack (for stacks that grow up). See figure:
![](./process_kernel_stack.png)

The `thread_info` is defined in `<asm/thread_info.h>`
    struct thread_info {
        struct task_struct *task;
        struct exec_domain *exec_domain;
        __u32 flags;
        __u32 status;
        __u32 cpu;
        int preempt_count;
        mm_segment_t addr_limit;
        struct restart_block restart_block;
        void *sysenter_return;
        int uaccess_err;
    }

Each task's `thread_info` structure is allocated at the end of its stack.
The `task` element points to the actual `task_struct`.

### Storing the Process Descriptor
The sys identifies process by PID of tyep `pid_t`

Inside the kernel, tasks are typically referenced directly by a pointer to
their `task_struct` structure.  The `current` macro is for quickly
reference to the current executing task. 

On x86, `current` is calculated by masking out the 13 least-significant
bits of the stack pointer to obtain the `thread_info` structure. (`struct
thread_info` is stored on the kernel stack). This is done by
`current_thread_info()`:
    movl $-8192, %eax
    andl %esp, %eax

Finally `current` dereferences the `task` member of `thread_info` to
return the `task_struct`:
    current_thread_info()->task;


### Process State
* `TASK_RUNNING`: the process is runnable. (running or on a run-queue)
* `TASK_INTERRUPTIBLE`: The process is sleeping, waiting for some
  condition to exist. When this condition exists, the kernel sets the
  process's state to `TASK_RUNNING`
* `TASK_UNINTERRUPTIBLE`: does not wake up and become running if it
  receives a signal. 
* `__TASK_TRACED`: being *traced* by another process, such as a debugger,
  via *ptrace*.
* `__TASK_STOPPED`: occurs if the task receives `SIGSTOP`, `SIGTSTP`,
  `SIGTTIN` or `SIGTTOU`

![](./p_state.png)

## Process Creation
Unix separating these steps into two distinct functions:`fork()` and
`exec()`. `fork()` copies parent and `exec()` loads a new executable. 

### Copy-on-Write
In Linux, `fork()` is implemented through the use of `copy-on-write`
pages.  The data is marked in such a way that if it si written to, a
duplicate is made and each process receives a unique copy. Until then,
they are shared read-only.

The only overhead incurred by `fork()` is the duplication of parent's page
tables and creation of uniqu process descriptor for the child.

### Forking
Linux implements `fork()` via the `clone()` system call. This call takes a
series of flags that sepcify which recources the parent and child process
should share. The `clone()` system call, in term, calls `do_fork()`
(defined in `kernel/fork.c`). This function call `copy_process()` and then
starts the process running.

Work done by `copy_process()`:
1. calls `dup_task-struct()`, which creates new:

    - kernel stack
    - `thread_info` structure
    - `task_struct` for new process. 

   Values are identical to current process.
* Check the new child not exceed the resource limit.
* Various members of the new process descriptor are cleared or set to
  initial values.  The bulk of the values in `task_struct` remain
  unchanged.
* Child's state is set to `TASK_UNINTERRUPTIBLE`
* `copy_process` calls `copy_flags()`. The `PF_SUPERPRIV` flag, which
  denotes the superuser privileges, is cleared. The `PF_FORKNOEXEC` which
  denotes a process that has not called `exec()` is set.
* It calls `alloc_pid()` to assign an available PID to the new task
* Depending on the flags passed to `clone()`, `copy_process()` either
  duplicates or shares open files, filesystem information, singal
  handlers, process address space, and namespace.
* Finally, `copy_process()` cleans up and returns to the caller a pointer
  to the new child.

Back in `do_fork()` , if `copy_process()` returns successfully, the new child is woken up
and run. Deliberately, the kernel runs the child process first. 8 In the common case of the
child simply calling `exec()` immediately, this eliminates any copy-on-write overhead that
would occur if the parent ran first and began writing to the address space.

## The Linux Implementation of Threads
Linux implements all threads as standard processes. A thread is merely a
process that shares certain resources with other processes.
### Creating Threads
Threads are created the same as normal tasks, with the exception that the
`clone()` system call is passed flags corresponding to the specific
resources to be shared:
    clone(CLONE_VM | CLONE_FS | CLONE_FILES | CLONE_SIGHAND, 0);
Results identical to `fork()`, except that the address space, filesystem
resources, file descriptors, and signal handlers are shared.

### Kernel Threads
Kernel threads: standard processes that exist solely in kernel space.
Kernel threads do not have an address space. (Their `mm` pointer, which
points at their address space, is `NULL`) The operate only in kernel-space
and do not context switch into user space. Kernel threads are schedulable
and preemptable.

Linux delegates several tasks to kernel threads, most notably the *flush*
tasks and the *ksoftirqd* tasks. See kernel threads by `ps -ef`

Indeed, a kernel thread can be created only by another kernel thread.The
kernel handles this automatically by forking all new kernel threads off of
the *kthreadd* kernel process.The interface, declared in `<linux/kthread.h>` ,
for spawning a new kernel thread from an existing one is

    ruct task_struct *kthread_create(int (*threadfn)(void *data),
                                    void *data,
                                    const char namefmt[],
                                    ...)

The new task is created via the `clone()` system call by the `kthread`
kernel process. The new process will run the `threadfn` function, which is
passed the `data` argument.
