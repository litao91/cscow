# Loading
## Loader
The first part of pintos that run is the loader, in `threads/loader.S`.

* PC BIOS loads the loader into memory
* The loader in turn, is responsible for finding the kernel on disk and
  loading it into the memory.
* Then jump to the start of the kernel.

## Low-level Kernel Initialization
The loader's last action is to transfer the control to the kernel's entry
point, which is `start()` in the `thread/start.S`.

The job is to switch the CPU for legacy 16-bit real mode into 32-bit
protected mode.

1. Obtain the machine's memory size, by asking the BIOS.
* Enable the A20 line, that is the CPU's address line numbered 20. PCs
  boot with this address line fixed at 0, which means that attempts to
  access memory beyond the first 1MB will fail.
* Next, the loader creates a basic page table. This maps the 64 MB at the
  base of virtual memory directly to the identical physical address.
* After the page table, we laod the CPU's control registers to turn on
  protected mode and paging, and set up the segment registers.

## Higher-Level Kernel Initialization
The kernel proper starts with `main()` function.

When `main()` start, the system is in pretty raw state. We are in 32-bit
protected mode with paging enabled, but hardly anything is ready. Thus
`main()` function consists primarily of calls into other Pinos modules'
initialization functions, these functions are named `<module>_init`, where
`<module>` is the module's name., `module.c` is the module's source code
and `module.h` is the module's header.

1. Call `bss_init()`, which clear out the kernel's BSS, the traditional
   name for a segment that should be initialized to all zeros.
* `thread_init()` initializes the thread system.
* `palloc_init()`: initialize the kernel's memory system. It sets up the
  kernel page allocator.  `paging_init()` sets up a page table for the
  kernel. (project2 and later, `main()` also calls `tss_init()` and
  `gdt_init()`)
* Initialize interrupt:
    - `intr_init()` sets up the CPU's *interrupt descriptor table* (IDT)
      to ready it for interrupt handling. 
    - Then `timer_init()` and `kdb_init()` prepare for handling timer
      interrupts and keyboard interrupts
    - `input_init()` sets up to merge series the keyboard input into one stream.
    - In project 2 and later, we also prepare to handle interrupts caused
      by user programs using `exeception_init()` and `syscall_init()`.
* Now interrupts are setup, we can start the scheduler with
  `thread_start()`, which creates the idle thread and enables interrupts.
  With interrupts enabled, interrupt-driven series port I/O becomes
  possible, so we use `serieal_init_queue()` to switch to that mode.
  Finally `timer_callibrate()` calibrates the timer for accurate short
  delays.
* If the FS is compiled in, as it will starting in project 2, we
  initialize the IDE disks with `ide_init()`, then the file system with
  `filesys_init`.
* Boot is complete, so we print a message.
* Function `run_actions()` now parses and executes actions specified on
  the kernel command line.

