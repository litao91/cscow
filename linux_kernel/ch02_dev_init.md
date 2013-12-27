# Device Environment initialization and activate process `0`

## Setup root device, hard disk

* Kernel data sector in the memory written by `bootsect` at memory address
`0X901FC` is the information of floppy disk (set as `ROOT_DEV`)
* Starting from memory address of `0x90080` has 32bits is `drive_info`.

Source:

    init/main.c
    //at address 0x90080 is the a pointer to a struct with type
    //struct drive_info *, a pointer to drive_info type.
    //The leading * is a deference to it.
    //The hard disk parameter table
    #define DRIVE_INFO (*(struct drive_info *)0x90080) 
    #define ORIG_ROOT_DEV (*(unsigned short *)0x901FC)
    ...
    struct drive_info{char dummy[32]; } drive_info; 

    void main(void) {
        ROOT_DEV = ORIG_ROOT_DEV;
        drive_info = DRIVE_INFO;
        ...
    }


## Arrange Memory structure, buffer, ram disk, main memory
* Main memory: space for program execution
* Buffer: for the communication between CPU and IO devices. 
* Virtual Disk: optional

Set up main memory and buffer position and size according to memory size


    //extended memory size at mem address 0x90002
    #define EXT_MEM_K (*(unsigned short *)0x90002)
    ...
    void main() {
        ...
        //Setup the position and size of main memory and buffer.according to
        //memory size
        memory_end = (1<<20) + (EXT_MEM_K<<10); //1MB + extended memory is the total memory size
        memory_end &= 0xfffff000; //Integral pages, ignore the remaining part that is less than a page
        if (memory_end > 16*1024*1024)
            memory_end = 16*1024*1024;
        if (memory_end > 12*1024*1024)
            buffer_memory_end = 4*1024*1024;
        else if (memory_end > 6*1024*1024)
            buffer_memory_end = 2*1024*1024;
        else
            buffer_memory_end = 1*1024*1024;
        //Main memory comes after buffer memory
        main_memory_start = buffer_memory_end;
        ...
    }

## Setup ram disk space and initialization
    init/main.c
    void main(void) {
    ...
        //check the RAMDISK flag in makefile, set ram disk if exist
        #ifdef RAMDISK
            main_memory_start += rd_init(main_memory_start, RAMDISK*1024);
        #endif
    }
    ...
    // kernel/blk_drv/blk.h
    #define NR_BLK_DEV 7 //number of devices
    ...
    struct blk_dev_struct {
        void (*request_fn)(void); //request function
        struct request * current_request;
    };
    ...
    #if (MAJOR_NR == 1)
    ...
    #define DEVICE_REQUEST do_rd_request
    ...

    //kernel/blk_drv/ll_rw_blk.c

    /* blk_dev_struct is:
     *    do_request-address
     *    next-request
     * Create a list of blk_dev_struct types
     */
    struct blk_dev_struct blk_dev[NR_BLK_DEV] = {
        { NULL, NULL },        /* no_dev */
        { NULL, NULL },        /* dev mem */
        { NULL, NULL },        /* dev fd */
        { NULL, NULL },        /* dev hd */
        { NULL, NULL },        /* dev ttyx */
        { NULL, NULL },        /* dev tty */
        { NULL, NULL }        /* dev lp */
    };

    ...
    //kernel/ramdisk.c
    #define MAJOR_NR 1 //ram disk corresponding the 2nd device


    /*
     * Returns amount of memory which needs to be reserved.
     * rd = ramdisk, initialize ram disk
     * mem_start: the starting address of ramdisk, right before the main
     * memory
     */
    long rd_init(long mem_start, int length) // ram disk initialization
    {
        int    i;
        char    *cp;

        // blk_dev used link a kind of device to it's corresponding request
        // the line here link the 2nd item of blk_dev, corresponding to
        // the request of ramdisk to do_rd_request()
        // this is setted at blk.h, on the block #if (MAJOR_NR==1)
        blk_dev[MAJOR_NR].request_fn = DEVICE_REQUEST;
        rd_start = (char *) mem_start;
        rd_length = length;
        cp = rd_start;
        for (i=0; i < length; i++)
            *cp++ = '\0'; //initialize to 0
        //return th length of ramdisk, used to set the new main_memory_start
        return(length);
    }

## Initialize `mem_map` the memory management structure
Use `mem_init()` function to setup the structure of main memory.

Source code:

    // init/main.c
    void main(void) {
        ...
        mem_init(main_memory_start, memory_end);
        ...
    }


    // mm/memory.c
    //The following code for mem_init, initialize the memory management
    //structure
    #define LOW_MEM 0x100000 // 1 MB
    #define PAGING_MEMORY (15*1024*1024)
    #define PAGING_PAGES (PAGING_MEMORY>>12)  // page number of 15 MB
    #define MAP_NR(addr) (((addr)-LOW_MEM)>>12)
    #define USED 100
    ...
    static long HIGH_MEMORY 0;
    ...
    //initialize all the other elements to 0
    static unsigned char mem_map [PAGING_PAGES] = {0, } 

    void mem_init(long start_mem, long end_mem) {
        int i;

        HIGH_MEMORY = end_mem;
        // PAGING_PAGES number of pages to do paging
        for (i=0 ; i<PAGING_PAGES ; i++)
            mem_map[i] = USED;
        i = MAP_NR(start_mem); //start_mem is 6MB, after ramdisk
        end_mem -= start_mem;
        end_mem >>= 12; // Page number of 16 MB
        // set the pages in main memory to zero
        while (end_mem-->0)
            mem_map[i++]=0;
    }

System do paging for memory that more than 1 MB, with `mem_map[]`. 
1. Set all the pages to `USED`
* set all the pages in the main memory to 0

After that, system will treat 0 pages as blank pages

Why 1 MB and above? 
* Kernel process and user process are using different paging management
    - Kernel: linear address is the same as physical address.
    - User: linear is different from logical.
* Reason: user process cannot infer the physical address, so it cannot
  access the memory of other processes.
* Data within 1 MB are kernel instructions and data managed by kernel. So
  forbid user process to access it. So it is excluded in paging.

## Linking between Exception Handler and Interruption Services
`trap_init()` function link the service program for interruption and
exception to IDT (interruption descriptor table)

Source:

    // init/main.c
    void main(void) {
        ...
        trap_init();
        ...
    }

    //kernel/traps.c

    void trap_init(void) {
        int i;

        set_trap_gate(0,&divide_error); /* divide by zero */
        set_trap_gate(1,&debug); /* single step debugging */
        set_trap_gate(2,&nmi); /* non maskable interruption */
        set_system_gate(3,&int3);    /* int3-5 can be called from all */
        set_system_gate(4,&overflow); /* overflow error */
        set_system_gate(5,&bounds); /* boundary checking error */
        set_trap_gate(6,&invalid_op); /* Invalid operation */
        set_trap_gate(7,&device_not_available);
        set_trap_gate(8,&double_fault);
        set_trap_gate(9,&coprocessor_segment_overrun);
        set_trap_gate(10,&invalid_TSS);
        set_trap_gate(11,&segment_not_present);
        set_trap_gate(12,&stack_segment); /* stack error */
        set_trap_gate(13,&general_protection);
        set_trap_gate(14,&page_fault);
        set_trap_gate(15,&reserved);
        set_trap_gate(16,&coprocessor_error);
        //Set the remaining gate to reserved
        for (i=17;i<48;i++)
            set_trap_gate(i,&reserved);
        set_trap_gate(45,&irq13); // coprocessor
        outb_p(inb_p(0x21)&0xfb,0x21); // Allow IRQ3 interruption request
        outb(inb_p(0xA1)&0xdf,0xA1);
        set_trap_gate(39,&parallel_interrupt);
    }

    // include/asm/system.h
    #define _set_gate(gate_addr,type,dpl,addr) \
    __asm__ ("movw %%dx,%%ax\n\t" \                      // assign the lower word of edx to the lower word of eax
        "movw %0,%%dx\n\t" \                             // %0 corresponding to "i"
        "movl %%eax,%1\n\t" \                            // %1 corresponding to the first "o"
        "movl %%edx,%2" \                                // %2 corresponding to the second "o"
        : \                                              // this colon corresponding to output, the next colon is input
        : "i" ((short) (0x8000+(dpl<<13)+(type<<8))), \  // Immediate number
        "o" (*((char *) (gate_addr))), \                 // The address of 4 bytes of interruption descriptor
        "o" (*(4+(char *) (gate_addr))), \               // the last 4 bytes of interruption
        "d" ((char *) (addr)),"a" (0x00080000))          // "d" edx and "a" eax

    ...
    #define set_trap_gate(n, addr) \
        _set_gate(&idt[n], 15, 0, addr)

From the code: if `n` is zero, then `gate_addr` is `&idt[0]`, that is the
 address of the `idt` entry. `dpl`(descriptor privilege level) is `0`,
 `addr` is the address `divide_error(void)`, the interruption service.

 `movl %%eax, %1\n\t"` is assigning the value of `eax` to
 `((char*)(gate_addr))`. That is assigning to the first 4bits of
 `idt[0]`

## Initialize the structure of block devices request entry
Two kinds devices:
* Block devices: 
* Character Devices:

Block devices divide the storage into blocks, each block has block
address, each block can read and write independently. We must go through
buffer to communicate with block devices. Decide which I/O request by
checking the interruption requests.


    // init/main.c:
    void main(void) {
        ...
        blk_dev_init(); // block devices initialization.
        ...
    }

    // kernel/blk_drv/blk.h:
    #define NR_REQUEST    32 // number of entries in the request-queue
    struct request {
        int dev;        /* -1 if no request */
        int cmd;        /* READ or WRITE */
        int errors;
        unsigned long sector;
        unsigned long nr_sectors;
        char * buffer;
        struct task_struct * waiting;
        struct buffer_head * bh;
        struct request * next; // A linked list
    };


    // kernel/blk_drv/ll_rw_block.c
    ...
    struct request request[NR_REQUEST];  //array of request list
    ...

    void blk_dev_init(void) {
        int i;

        for (i=0 ; i<NR_REQUEST ; i++) {
            request[i].dev = -1;    /* set to no request */
            request[i].next = NULL; /* empty request */
        }
    }


# Link Interactive devices's interruption with interruption services
Link interruption from serial ports and the related service routine in IDT
`rs_init()` to setup serial ports and `con_init()` to setup display.

    // init/main.c
    void main(void) {
        ...
        tty_init();
        ...
    }

    //kernel/chr_drv
    void tty_init(void) {
        rs_init();
        con_init();  // setup console interrupt
    }

## Setup Serial Ports
Basically implement the `rs232` functions. 
Link IDT with two serial port interruptions. To be specific, link the
address of `rs1_interrupt` and `rs2_interrupt` to IDT. Initialize things
and finally allow `8259A` chip send `IRQ3` and `IRQ4` requests.

Source:

    // kernel/chr_drv/serial.c
    void rs_init(void) {
        set_intr_gate(0x24,rs1_interrupt);  // set up serial port 1 interruption
        set_intr_gate(0x23,rs2_interrupt);  // serial port 2 interruption
        init(tty_table[1].read_q.data);     // initialize serial port 1
        init(tty_table[2].read_q.data);     // initialize serial port 2
        outb(inb_p(0x21)&0xE7,0x21);        // Allow IRQ3 and IRQ4
    }


## Setup display
At the time of linux 0.11, most grahpical adapter is single color. We
assume it's single color EGA. So the Graphical memory's address `0xb0000`
to `0xb8000`, the index register's port is set to `0x3b4`, the data
register is set to `0x3b5`

## Setup keyboard
First link keyboard's interruption service to the IDT, then re-enable the
keyboard's interruption from `8259A`, allow `IRQ1` sending interruption
signal.

The source code is in `kernel/chr_drv/console.c`, omit here.

# Time initialization
Get the start up time from `CMOS` chip, by calling `time_init()`

Source:
    // init/main.c
    void main(void) {
        ...
        time_init();
        ...
    }
    // read CMOS time
    #define CMOS_READ(addr) ({ \
    outb_p(0x80|addr,0x70); \
    inb_p(0x71); \
    })

    #define BCD_TO_BIN(val) ((val)=((val)&15) + ((val)>>4)*10)

    static void time_init(void) {
        struct tm time;

        do {
            time.tm_sec = CMOS_READ(0);
            time.tm_min = CMOS_READ(2);
            time.tm_hour = CMOS_READ(4);
            time.tm_mday = CMOS_READ(7);
            time.tm_mon = CMOS_READ(8);
            time.tm_year = CMOS_READ(9);
        } while (time.tm_sec != CMOS_READ(0));
        BCD_TO_BIN(time.tm_sec);
        BCD_TO_BIN(time.tm_min);
        BCD_TO_BIN(time.tm_hour);
        BCD_TO_BIN(time.tm_mday);
        BCD_TO_BIN(time.tm_mon);
        BCD_TO_BIN(time.tm_year);
        time.tm_mon--;
        startup_time = kernel_mktime(&time);  // startup time, from
         //1970/1/1
        
    }


# Initialization process 0
Note that in Linux, each process has an independent `task_struct`. The
elements of `task_struct` contain or point to all of the information that
the kernel needs to run the process(e.g. PID, pointer to the user stack,
name of the executable object file, and program counters)

Process `0` is the first process in Linux. It's the first parent process.
Include the following:
1. System initialize the process `0`. The template of process `0` has been
   pre-designed with `init_task = `{INIT_TASK}`. What we remain to do is
   linking the `LDT` (local descriptor table) and `TSS`(Task state
   segment) in the `task_struct` of process `0` to `GDT`.
* Setup clock interruption, allowing multi-thread.
* Process `0` should have the capability to have system call. It is done
  by linking `system_call` with `IDT` (interruption description table)
  through calling `set_system_gate`.

The process `0` have the above abilities and "inherit" those abilities to
ti's children.  Its' implemented in `sched_init()` (Schedule
initialization).

Source:
    // init/main.c
    int main(void) {
        ...
        sched_init(); //schedule the initialization
        ...
    }

    // kernel/sched.c
    ...
    #define LATCH (1193180/HZ)   // HZ is 100 defined in sched.h
    ...

    union task_union {  // for both task_struct and kernel stoack
        struct task_struct task;
        char stack[PAGE_SIZE]; // Page size is 4KB
    };

    static union task_union init_task = {INIT_TASK,}; //process 0's task_struct
    ...
    //Initialize the process slot task[NR_TASKS]. Make the first
    //item process 0, so task[0] is occupied by task_struct, NR_TASKS
    //number of tasks
    struct task_struct * task[NR_TASKS] = {&(init_task.task), };
    ...

    void sched_init(void) {
        int i;
        struct desc_struct * p;

        if (sizeof(struct sigaction) != 16)
            panic("Struct sigaction MUST be 16 bytes");
        set_tss_desc(gdt+FIRST_TSS_ENTRY,&(init_task.task.tss));  //setup TSS0, Task state segment
        set_ldt_desc(gdt+FIRST_LDT_ENTRY,&(init_task.task.ldt));  //setup LDT0
        //starting from the 6th item, that is from TSS1, all items
        //clear to zero,
        //Clear the process slots from 1. The 0 item for process 0
        p = gdt+2+FIRST_TSS_ENTRY;
        // use for loop to clear `task[64]` 
        for(i=1;i<NR_TASKS;i++) {
            task[i] = NULL;
            p->a=p->b=0;
            p++;
            p->a=p->b=0;
            p++;
        }

    /* Clear NT, so that we won't have troubles with that later on */
        __asm__("pushfl ; andl $0xffffbfff,(%esp) ; popfl");
        ltr(0);  //link TSS to TR register
        lldt(0); // link LDT to LDTR
        outb_p(0x36,0x43);        /* binary, mode 3, LSB/MSB, ch 0, setup timeout */
        outb_p(LATCH & 0xff , 0x40);    /* LSB */ // interrupt every 10 ms
        outb(LATCH >> 8 , 0x40);    /* MSB */
        set_intr_gate(0x20,&timer_interrupt);//Setup timer interrupt
        outb(inb_p(0x21)&~0x01,0x21); //allow timer interrupt
        set_system_gate(0x80,&system_call); // entrance of system call
    }

    //include/linux/shed.h:
    #define FIRST_TSS_ENTRY 4 // GDT's 4th entry, TSS0's entry
    #define FIRST_LDT_ENTRY (FIRST_TSS_ENTRY+1) //Entry of LDT0

    #define _TSS(n) ((((unsigned long) n)<<4)+(FIRST_TSS_ENTRY<<3))
    #define _LDT(n) ((((unsigned long) n)<<4)+(FIRST_LDT_ENTRY<<3))
    #define ltr(n) __asm__("ltr %%ax"::"a" (_TSS(n)))
    #define lldt(n) __asm__("lldt %%ax"::"a" (_LDT(n)))
    ...


Note `include/asm/system.h` defines `set_intr_gate`, `set_trap_gate`
`set_system_gate` `_set_tssldt_desc` omit here

`inlucde/linux/sched.h` defines `tss_struct` and `task_struct`, the
`INIT_TASK` defined the struct of process 0. 
Lots of assembly code omit here.


### Initialize Process 0 (`init_task`)
The essential of `shed_init` function:

    set_tss_desc(gdt+FIRST_TSS_ENTRY,&(init_task.task.tss));  //setup TSS0, Task state segment
    set_ldt_desc(gdt+FIRST_LDT_ENTRY,&(init_task.task.ldt));  //setup LDT0

`gdt`:global descriptor table. Global descriptor points to `tss` and
`LDT`.

The purpose of the lines are initialize the GDT entries for process `0`,
namely, the 4th and 5th entries, `TSS0` (Task State Segment) and `LDT0` 


### Setup `timer_interrupt`
Clock interrupt is the base of round robin. Three steps:
1. Setup `8253` timer. Most importantly setup `LATCH`.
* Setup timer_interrupt, so that system can find `timer_interrupt()` when
  interruption happens.
* Enable the timer interrupt in `8259A`.

### setup system call entrance
`system_call` links with `int 0x80` interrupt descriptor. All the system
call, after raising an `int 0x80` soft interruption, os always call the
specific system method through this entrance. 

## Initialize buffer management struct
Buffer is for data exchange between memory and devices (such as hard
disk).

Operation system make use of a complicated hash table consists of
`hash_table[NR_HASH]` and `buffer_head`(a duble linked list) to manage the
buffer. 

    void main(void) {
        ...
        buffer_init(buffer_memory_end);
        ...
    }

In buffer_init function, starting simenteneously from the end of the
kernel and the end of buffer, growing in opposite direction, make
`buffer_head` and buffer blocks in pair. 
`buffer_head`'s entries:
* `b_count` reference count
* `b_uptodate` up to date flag
* `b_dirt` Dirty flag
* `b_data` point to the buffer block
* `buffer_head` `b_prev_free` and `b_next_free` form an doble linked list.

    // fs/buffer.c
    ...
    // end is the end of kernel 
    struct buffer_head * start_buffer = (struct buffer_head *) &end; 
    struct buffer_head * hash_table[NR_HASH];
    static struct buffer_head * free_list;
    ...

    void buffer_init(long buffer_end) { 
        struct buffer_head * h = start_buffer;  
        void * b; int i;

        if (buffer_end == 1<<20)
            b = (void *) (640*1024);
        else
            b = (void *) buffer_end;
        //h starts from lower address and b from higher address side.
        //assign blocks to head
        while ( (b -= BLOCK_SIZE) >= ((void *) (h+1)) ) {
            h->b_dev = 0;
            h->b_dirt = 0;
            h->b_count = 0;
            h->b_lock = 0;
            h->b_uptodate = 0;
            h->b_wait = NULL;
            h->b_next = NULL;
            h->b_prev = NULL;
            h->b_data = (char *) b;
            h->b_prev_free = h-1;
            h->b_next_free = h+1;
            h++;
            NR_BUFFERS++;
            if (b == (void *) 0x100000)
                b = (void *) 0xA0000;
        }
        h--;
        free_list = start_buffer; //pointing to the first buffer_head
        free_list->b_prev_free = h;
        h->b_next_free = free_list;
        for (i=0;i<NR_HASH;i++) //clear hash_table
            hash_table[i]=NULL;
    }

## Initialize hard disk
Create communication environment for block devices such as hard disk.

In `hd_init()`, hook `do_hd_request() ` with `blk_dev`'s control
structure.  All the hdd requests will be handled by `do_hd_request()`.
Then hook `hd_interrupt()` with `IDT`. Finally, re-enable `8259A`'s `int
2`

    // init/main.c
    void main(void) {
        ...
        hd_init();                       // initialize hard disk
        ...
    }

    void hd_init(void) {
        blk_dev[MAJOR_NR].request_fn = DEVICE_REQUEST;  // hook do_hd_request
        set_intr_gate(0x2E,&hd_interrupt);              // set hard disk interrupt
        outb_p(inb_p(0x21)&0xfb,0x21);                  // allow 8259A sending interrupt request
        outb(inb_p(0xA1)&0xbf,0xA1);
    }


## Initialize floppy disk
Implemented in `floppy_init()`, similar to `hd_init`.

## Re-enable interrupt
Now all the interrupt handler has been hooked in IDT, we can enable the
interrupt in 32bit protection mode, the significance is that we can use
system call. 

    //include/asm/system.h
    #define sti() __asm__ ("sti"::)

    //init/main.c
    void main(void) {
        ...
        sti()
        ...
    }

Now the `IF` in `EFLAGS` is `1`. And interruption is enabled. 

## Process 0 (`init_task`) from 0 privilege level to e privilege level
Linux defines that except from process 0, all the other processes have to
be created by a `3` privileged process. 

So before process 0 create process 1, it has to be flipped from privilege
`0` to privilege `3`.

    void main(void) {
        ...
        move_to_user_mode(); //from priviledge 0 to 3
        ...
    }

The `move_to_user_mode()` is defined in `include/system.h`

In the meantime, CPU also done a content switch and revert content.

In terms of execution sequence, interruption is similar to function call.
They all jump from a code segment to another segment. It needs a context
switch for each function call. 

Interruption is different from function call in terms of context switch.
Function call is pre-defined by the programmer so that compiler can
pre-generate the code for pushing and popping context. Interruption, on the
other hand, is unexpected, so the popping and pushing are done by
hardware. 

When CPU handles interruption, according to the setup in DPL, can
apply predefined privilege level flipping. 
