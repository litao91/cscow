# Linux 内核设计的艺术
## 从开机加电到执行`main()`函数之前的过程
### `head.s` 开始执行
在执行`main`函数之前，先要执行三个由汇编代码生成的函数:

* `bootsect`
* `setup`
* `head`

1. 第一步， 加载`bootsect`到`0x07C00`
* 第二步， 加载`setup`到`0x90200`

这两段程序是分别加载，分别执行

`haed`程序与他们不同:

* 先将`head.s`汇编成目标代码(object code)
* 将用C写的内核编译成目标代码(object code)
* 然后链接(link)成system 模块

也就是说, 两者紧挨着, head在前, system在后

## Device Environment initialization and activate process `0`

### Setup root device, hard disk

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


### Arrange Memory structure, buffer, ram disk, main memory
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

### Setup ram disk space and initialization
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
    long rd_init(long mem_start, int length)
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
