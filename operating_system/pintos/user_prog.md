# User Program
We allow more than one process at a time. Each process has one thread
(multi-threaded processes are not supported). 

* User programs are written under the illusion that they have the entire
  machine.
* This means that when you lad and run multiple processes at a time, you
  must manage memory, scheduling, and other state correctly to maintain
  this illusion.

Files (`*.c` and `*.h`)
* `process`: Loads ELF binaries and start process
* `pagedir`: simple manager for 80x86 hardware page tables.
* `syscall`: Whenever a user process wants to access some kernel
  functionality, it invokes a system call. 
* `exception`: When a user process performs a privileged or prohibited
  operation, it traps into the kernel as an "exception" or "fault". These
  files handle exceptions.
* `gdt`: The Global Descriptor Table (GDT) is a table that descries the
  segments in use. These files set up the GDT. 
* `tss`: The Task-State Segment (TSS) is used for 80x86 architecture task
  switching. Pintos uses the TSS only for switching stacks when a user
  process enters in interrupt handler, as does Linux.

## How user programs work
* Pintos can load ELF executables with the loader provided for you in
  `userprog/process.c`

## Virtual Memory Layout
Virtual Memory in Pintos is divided into two regions:

* User virtual memory: `0` up to `PHYS_BASE`, in `threads/vaddr.h` and
  defaults to `0xc0000000`(3GB)
* Kernel virtual memory: from `PHYS_BASE` up to 4GB

Details
* User virtual memory is per-process. When the kernel switches from one
  process to another, it also switches user virtual address spaces by
  changing the processor's page directory base register
  (`pagedir_activate()` in `userprog/pagedir.c`). `struct thread` contains
  a pointer to a process's page table.
* Kernel virtual memory is global. It is always mapped the same way.
* A user program can only access its own user virtual memory causes a page
  fault, handled by `page_fault()` in `userprog/exception.c`


## Typical Memory Layout
In practice, user virtual memory laid out like this:

![]('./figures/mem_layout.png')

* The code segments starts at user virtual address `0x08084000`,
  approximately 128MB from bottom
* The linker sets the layout of a user program in memory, as directed by a
  "linker script" that tells it the names and locations of the various
  program segments.
