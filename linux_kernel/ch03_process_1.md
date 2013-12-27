# The creation and execution of process 1
## Creation of process 1
Linux use `fork` to create new threads.

    // init/main.c
    ....
    static inline _syscall0(int,fork) // corresponding to fork()
    static inline _syscall0(int,pause)
    static inline _syscall1(int,setup,void *,BIOS)
    ...
    void main(void) {
        ...
        sti();                           // setup interruption  (re-enable)
        move_to_user_mode();             // from privilege level 0 to 3
        if (!fork()) {        /* we count on this going ok */
            init();
        }
    /*
     *   NOTE!!   For any other task 'pause()' would mean we have to get a
     * signal to awaken, but task0 is the sole exception (see 'schedule()')
     * as task 0 gets activated at every idle moment (when no other tasks
     * can run). For task0 'pause()' just means we go check if some other
     * task can run, and if not we return here.
     */
        for(;;) pause();
    }



From the declaration of `fork()` above, calling `fork` is actually
execute the macro function `syscall0` in `unistd.h`
    
    //include/unistd.h
    #define __NR_setup	0	/* used only by init, to get system going */
    #define __NR_exit	1
    #define __NR_fork	2
    #define __NR_read	3
    #define __NR_write	4
    #define __NR_open	5
    #define __NR_close	6
    ...
    #define _syscall0(type,name) \
      type name(void) \
    { \
    long __res; \
    __asm__ volatile ("int $0x80" \
        : "=a" (__res) \
        : "0" (__NR_##name)); \
    if (__res >= 0) \
        return (type) __res; \
    errno = -__res; \
    return -1; \
    }
        ...

    ...
    void _exit(int status);
    //volatile void _exit(int status);
    int fcntl(int fildes, int cmd, ...);
    static int fork(void);
    int getpid(void);
    int getuid(void);
    int geteuid(void);
    ...

    // include/linux/sys.h
    extern int sys_setup();
    extern int sys_exit();
    extern int sys_fork(); // corresponding to _sys_fork in system_call.s
    extern int sys_read();
    extern int sys_write();
    extern int sys_open();

Note that the line `_syscall0(int, fork)` will be expanded to:
    int fork(void) { 
        long __res; 
    // int 0x80 is the entrance of system call
        __asm__ volatile ("int $0x80"
            : "=a" (__res)  // output part, _res value assigned to eax
            : "0" (2));     // input part, assign __NR_fork to eax
        if (__res >= 0)     // interruption return
            return (int) __res; 
        errno = -__res; 
        return -1; 
    }

The path of system call:
![](syscall.png?raw=true)

Execution:
1. `:"0" (__NR_fork)`, assign `__NR_fork`, the number of `fork` in
   `sys_call_table[]`, to `eax`. This is the offset number of `sys_fork()`
   in `sys_call_table`.
* `int $0x80`, generate a soft-interrupt. Interrupt will cause CPU to push
  registers `ss`, `esp`, `eflags`, `cs`, `eip` into `init_task`'s kernel
  stack. `move_to_user_mode` mentioned previously was to mimic the pushing
  of hardware. Those data will be used later to initialize `TSS` of
  process 1.

    // kernel/system_call.s
    system_call:
        cmpl $nr_system_calls-1,%eax  # int 0x80 -- entrance of system call
        ja bad_sys_call
        push %ds                      # The next 6 push are parameters for copy_
        push %es
        push %fs
        pushl %edx
        pushl %ecx                    # push %ebx,%ecx,%edx as parameters
        pushl %ebx                    # to the system call
        movl $0x10,%edx               # set up ds,es to kernel space
        mov %dx,%ds
        mov %dx,%es
        movl $0x17,%edx               # fs points to local data space
        mov %dx,%fs
        call *sys_call_table(,%eax,4) # call (_sys_call_table + 2x4, _sys_fork
        pushl %eax
        movl current,%eax
        cmpl $0,state(%eax)           # state
        jne reschedule
        cmpl $0,counter(%eax)         # counter
        je reschedule
    ret_from_sys_call:
        movl current,%eax             # task[0] cannot have signals
        cmpl task,%eax
        je 3f
        cmpw $0x0f,CS(%esp)           # was old code segment supervisor ?
        jne 3f
        cmpw $0x17,OLDSS(%esp)        # was stack segment = 0x17 ?
        jne 3f
        movl signal(%eax),%ebx
        movl blocked(%eax),%ecx
        notl %ecx
        andl %ebx,%ecx
        bsfl %ecx,%ecx
        je 3f
        btrl %ecx,%ebx
        movl %ebx,signal(%eax)
        incl %ecx
        pushl %ecx
        call do_signal
        popl %eax
    3:	popl %eax
        popl %ebx
        popl %ecx
        popl %edx
        pop %fs
        pop %es
        pop %ds
        iret

Note the line `call _sys_call_table (,%eax, 4)`, `eax` has been assigned
2, so this line is `call _sys_call_table + 2x4` (every entry in
`_sys_call_table` is 4bits). So it's equivalent to `call
_sys_call_table[2]`

    ...
    _sys_call:
    ...
    _sys_fork:

    sys_fork:
        call find_empty_process
        testl %eax,%eax # if the returned value is -EAGAIN(11), there have
                        # been 64 processes running 
        js 1f
        push %gs        # next 5 pushes for copy_process's parameters
        pushl %esi
        pushl %edi
        pushl %ebp
        pushl %eax      # the returned value 
        call copy_process
        addl $20,%esp
    1:	ret
    ...

### Find an unoccupied Process Number
Start executing `sys_fork()`. In `sched_init()` we've cleared the items in
`task[64]` except the 0th entry. Now we need to call
`find_empty_process()` to assign process 1 a new pid and `taks[64]` entry.

    // kernel/fork.c:

    int find_empty_process(void) //find a vacant position for new process
    {
        int i;

        repeat:
            if ((++last_pid)<0) last_pid=1;                           // if overflowed, assign 1
            for(i=0 ; i<NR_TASKS ; i++)                               // NR_TASKS is 64
                if (task[i] && task[i]->pid == last_pid) goto repeat;
        for(i=1 ; i<NR_TASKS ; i++)                                   // find the first empty i
            if (!task[i])
                return i;
        return -EAGAIN;                                               // EAGAIN is 11
    }

The last value that pushed to the stack is the task number `nr` returned
by `find_empty_process`. This is also the first parameter for
`copy_process`.

Now we are ready to execute `copy_process()`. Note that all the parameters
are related to previous pushing. 

    // kernel/fork.c
    int copy_process(int nr,long ebp,long edi,long esi,long gs,long none,
            long ebx,long ecx,long edx,
            long fs,long es,long ds,
            long eip,long cs,long eflags,long esp,long ss) {
        //the parameters are pushed by int 0x80 system_call, and sys_fork
        struct task_struct *p;
        int i;
        struct file *f;

        // get most significant page, use this page as task_union
        p = (struct task_struct *) get_free_page();
        if (!p)
            return -EAGAIN;
        task[nr] = p;
    }

Then call `get_free_page()` to request for a free page in main memory.
`get_free_page` will request empty space from the end of the main memory. 

Note task union is defined as 
    union task_union {
        struct task_struct task;
        char stack[PAGE_SIZE];
    }
The front of the `task_union` is `task_struct` and lower end is
kernel stack. And they are added up to exactly one page. 

    int copy_process(int nr,long ebp,long edi,long esi,long gs,long none,
            long ebx,long ecx,long edx,
            long fs,long es,long ds,
            long eip,long cs,long eflags,long esp,long ss) {
    ...
