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
