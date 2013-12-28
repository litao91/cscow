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
![](syscall.jpg?raw=true)

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
        ...
    }

Then call `get_free_page()` to request for a free page in main memory.
`get_free_page` will request empty space from the end of the main memory. 

Note task union is defined as 
    union task_union {
        struct task_struct task;
        char stack[PAGE_SIZE];
    }

As shown in the following figure:
![](ts.jpg?raw=true)
The front of the `task_union` is `task_struct` and lower end is
kernel stack. And they are added up to exactly one page. 

    int copy_process(int nr,long ebp,long edi,long esi,long gs,long none,
            long ebx,long ecx,long edx,
            long fs,long es,long ds,
            long eip,long cs,long eflags,long esp,long ss) {
        ...
        // NOTE!: the following statement now work with gcc 4.3.2 now, and you
        // must compile _THIS_ memcpy without no -O of gcc.#ifndef GCC4_3
        // current point to task_struct of current process. Now child and
        // parent processes have exactly the same task struct
        // current: pointer to current process, p pointer to the new process
        *p = *current;    /* NOTE! this doesn't copy the supervisor stack */
                          /* This only copied the task_struct, the kernel
                           * stack haven't been copied */

        p->state = TASK_UNINTERRUPTIBLE; //only wake up when it is set to ready state
        p->pid = last_pid; // customized for child process
        p->father = current->pid;
        p->counter = p->priority;
        p->signal = 0;
        p->alarm = 0;
        p->leader = 0;        /* process leadership doesn't inherit */
        p->utime = p->stime = 0;
        p->cutime = p->cstime = 0;
        p->start_time = jiffies;
        ...
    }

![](cp_ts.jpg?raw=true)

### Setup paging management
#### Initialize code segment and data segment
Apply `copy_mem()`, setup process 1's:
* code segment
* data segment's base address
* segment's limit

Source:

    int copy_process(int nr,long ebp,long edi,long esi,long gs,long none,
            long ebx,long ecx,long edx,
            long fs,long es,long ds,
            long eip,long cs,long eflags,long esp,long ss) {
        ...

        if (last_task_used_math == current)
            __asm__("clts ; fnsave %0"::"m" (p->tss.i387));

        // setup the code segment, data segment and create the
        // first page table of child process
        if (copy_mem(nr,p)) {
            task[nr] = NULL;
            free_page((long) p);
            return -EAGAIN;
        }

        // increase the count of file reference,
        // since the child process also referencing the
        // file that referenced by its parent.
        for (i=0; i<NR_OPEN;i++)
            if ((f=p->filp[i]))
                f->f_count++;
    }

![](cp_pgt.jpg?raw=true)

    // include/linux/sched.h
    ...
    #define _set_base(addr,base)  \  // use base to setup addr
    __asm__ ("push %%edx\n\t" \
        "movw %%dx,%0\n\t" \
        "rorl $16,%%edx\n\t" \
        "movb %%dl,%1\n\t" \
        "movb %%dh,%2\n\t" \
        "pop %%edx" \
        ::"m" (*((addr)+2)), \
         "m" (*((addr)+4)), \
         "m" (*((addr)+7)), \
         "d" (base) \
        )
    ...
    #define set_base(ldt,base) _set_base( ((char *)&(ldt)) , (base) )
    ...
    
    static inline unsigned long _get_base(char * addr) //get addr's base address
    {
             unsigned long __base;
             __asm__("movb %3,%%dh\n\t"
                     "movb %2,%%dl\n\t"
                     "shll $16,%%edx\n\t"
                     "movw %1,%%dx"
                     :"=&d" (__base)
                     :"m" (*((addr)+2)),
                      "m" (*((addr)+4)),
                      "m" (*((addr)+7)));
             return __base;
    }

    #define get_base(ldt) _get_base( ((char *)&(ldt)) )

    // get segment's limit
    #define get_limit(segment) ({ \
    unsigned long __limit; \
    __asm__("lsll %1,%0\n\tincl %0":"=r" (__limit):"r" (segment)); \
    __limit;})

    // kernel/fork.c
    // child process's code segment, data segment and copy the
    // child process's first page table (from parent's page table)
    int copy_mem(int nr,struct task_struct * p)
    {
        unsigned long old_data_base,new_data_base,data_limit;
        unsigned long old_code_base,new_code_base,code_limit;

        // get the limit of code and data segment
        code_limit=get_limit(0x0f);
        data_limit=get_limit(0x17);

        // parent process's code segment and data segment's addr
        old_code_base = get_base(current->ldt[1]); // ldt[1] code
        old_data_base = get_base(current->ldt[2]); // ldt[2] data
        if (old_data_base != old_code_base)
            panic("We don't support separate I&D");
        if (data_limit < code_limit)
            panic("Bad data_limit");
        // 0x4000000 is 64MB
        new_data_base = new_code_base = nr * 0x4000000;
        p->start_code = new_code_base;
        set_base(p->ldt[1],new_code_base); // set base of code segment
        set_base(p->ldt[2],new_data_base); // set base of data segment
        if (copy_page_tables(old_data_base,new_data_base,data_limit)) {
            printk("free_page_tables: from copy_mem\n");
            free_page_tables(new_data_base,data_limit);
            return -ENOMEM;
        }
        return 0;
    }

#### Create Page Table and Page Table Entry
The virtual address is split to page directory entry, page table entry and
offset. 

Page directory entry is in page directory table for  page table
management. 

Linux0.11 has one page directory table. With the virtual page directory number in
the virtual address, we can find the page directory entry. With the page
directory entry, we can find the page table, the page table number in the
virtual address, we can locate the page table entry. Concatenate the
offset, we can get physical address. Shown as follow. 

![](vm_mgmt.jpg?raw=true)

Call `copy_page_tables()` to setup page directory table and copy page
table. 
    
    int copy_mem(int nr, struct task_struct* p) {
        ...
        set_base(p->ldt[1],new_code_base); // set base of code segment
        set_base(p->ldt[2],new_data_base); // set base of data segment
        //create the first page table for child, copy parent's first page
        // table
        if (copy_page_tables(old_data_base,new_data_base,data_limit)) {
            printk("free_page_tables: from copy_mem\n");
            free_page_tables(new_data_base,data_limit);
            return -ENOMEM;
        }
        return 0;
    }

`copy_page_tables` will basically request a free page for the new page
table. 
1.  **copy** the first 160 items in the parent process to this page. (Each
    page table entry manage 4KB memory space, 160 page entries can manage
    640KB). Now parent and child's page table entries pointing to the same
    pages. 
* Then we setup child process's page directory table 
* Override `CR3` to update page switch cache. 

Source code:

    // mm/memory.c
    ...
    #define invalidate() \
    __asm__("movl %%eax,%%cr3"::"a" (0))
    ...

     *  Well, here is one of the most complicated functions in mm. It
     * copies a range of linerar addresses by copying only the pages.
     * Let's hope this is bug-free, 'cause this one I don't want to debug :-)
     *
     * Note! We don't copy just any chunks of memory - addresses have to
     * be divisible by 4Mb (one page-directory entry), as this makes the
     * function easier. It's used only by fork anyway.
     *
     * NOTE 2!! When from==0 we are copying kernel space for the first
     * fork(). Then we DONT want to copy a full page-directory entry, as
     * that would lead to some serious memory waste - we just copy the
     * first 160 pages - 640kB. Even that is more than we need, but it
     * doesn't take any more memory - we don't copy-on-write in the low
     * 1 Mb-range, so the pages can be shared with the kernel. Thus the
     * special case for nr=xxxx.
     */
    int copy_page_tables(unsigned long from,unsigned long to,long size) {
        unsigned long * from_page_table;
        unsigned long * to_page_table;
        unsigned long this_page;
        unsigned long * from_dir, * to_dir;
        unsigned long nr;

        /* 0x 3fffff is 4MB, the size managed by a page table
         * the last 22bits of from and to should b zero, multiples of 4MB
         * The continuous 4MB space corresponding to a page table has to be
         * start from 0x000000 and a multiple of 4MB */
        if ((from&0x3fffff) || (to&0x3fffff))
            panic("copy_page_tables called with wrong alignment");



        /**
         * A table manage 4MB,  and an entry is 4 bits. So the entry address
         * is num of entry x 4. e.g. entry 0 at address 0, manage 0-4MB, entry
         * 1 at 4, manage 4-8MB, entry 2 at 8, 8-12MB and so on  >> 20 is the
         * num of MB 0xffc is 0b111111111100*/

        // >> 22 is number of 4MB, namely, entry number, copy from
        // from_dir -- page table directory to copy from, the address of page
        //             directory table entry
        // to_dir -- page table directory to copy to
        from_dir = (unsigned long *) ((from>>20) & 0xffc); /* _pg_dir = 0 */
        to_dir = (unsigned long *) ((to>>20) & 0xffc);
        size = ((unsigned) (size+0x3fffff)) >> 22;


        for( ; size-->0 ; from_dir++,to_dir++) {
            if (1 & *to_dir)
                panic("copy_page_tables: already exist");
            if (!(1 & *from_dir))
                continue;

            // *from_dir is the number of the page directory entry
            // 0xfffff000& is to clear the lower 12 bits. The higher 20bits
            // is the page table number.
            from_page_table = (unsigned long *) (0xfffff000 & *from_dir);
            if (!(to_page_table = (unsigned long *) get_free_page()))
                return -1;    /* Out of memory, see freeing */
            *to_dir = ((unsigned long) to_page_table) | 7; // 7 -> 111
            nr = (from==0)?0xA0:1024; // 0xA0, 160, number of entries to copy
            //copy page table from parent
            for ( ; nr-- > 0 ; from_page_table++,to_page_table++) {
                this_page = *from_page_table;
                if (!(1 & this_page))
                    continue;
                this_page &= ~2; // page table attribute, ~2 is 101, user, read only, valid
                *to_page_table = this_page;
                if (this_page > LOW_MEM) { // LOW_MEM doesn't paginate
                    *from_page_table = this_page;
                    this_page -= LOW_MEM;
                    this_page >>= 12;
                    mem_map[this_page]++; // include reference count
                }
            }
        }
        invalidate(); //reset CR3 to 0
        return 0;
    }
