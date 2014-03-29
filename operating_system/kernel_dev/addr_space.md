# The Process Address Space
The kernel also has to manage the memory of user-space process. This
memory is called the *process address space*.

Process address space: the representation of memory given to each
user-space process on the system.

The resource of memory is virtualized among the process on the system.
An individual process's view of memory as if it alone has full access to
the system's physical memory, and it can be much larger than physical
memory.

## A higher level view
List of address types used in linux:

* **User virtual addresses**: regular addresses seen by user-space
  programs
* **Physical addresses**: The address used between the processor and the
  system's memory.
* **Bus address**: The addresses used between peripheral buses and memory.
  Often, they are the same as addresses used by the processor.
* **Kernel logical address**: These makes up the normal space of kernel.
  These addresses map some portion (perhaps all) of main memory and are
  often treated as if they were physical addresses. On most architectures,
  logical addresses and their associated physical addresses differ only by
  a constant offset.
* **Kernel Virtual Address**: Kernel virtual addresses do not necessarily
  have linear, one-to-one mapping to physical memory.

### Physical Addresses and Pages
Physical memory is divided into discrete units called *pages*. The constant
`PAGE_SIZE` defined in `<asm/page.h>` gives the page size.

Any memory address is divisible into a page number (higher bits) and an
offset (least significant bits) within the page.

If you discard the offset and shift the rest of an offset to the right,
the result is called a *page frame number*. (PFN)

### High and Low Memory
The kernel (x86) splits the 4-GB virtual address space between user-space
and the kernel. A typical split dedicates the 3GB to user space, and the
1GB for kernel space.

The kernel's code and data structure must fit into that space, but the
biggest consumer of kernel address space is virtual mappings for physical
memory. 

The kernel cannot directly manipulate memory that is not mapped into the
kernel's address space. The kernel cannot directly manipulate memory that
is not mapped into the kernel's address space. The kernel, in other words,
needs its own virtual address for any memory it must touch directly.

Thus, for many years, the maximum amount of physical memory that could be
handled by the kernel was the amount that could be mapped into the
kernel's portion of the virtual address space, minus the space needed for
the kernel code itself. As a result, x86-based Linux systems could work
with a maximum of a little under 1 GB of physical memory

Low Memory: memory for which logical addresses exist in kernel space. on
most system you will likely encounter, all memory is low memory.

High Memory: Memory for which logical addresses do not exist.

### Page Tables
Page Table: Part of mechanism for translating virtual addresses into its corresponding
physical addresses. 

It is essentially a multilevel tree structured array containing
virtual-to-physical mappings and a few associated flags.

#### Virtual Memory Areas
Kernel data structure to manage distinct regions of a process's address
space.

A VMA represents a homogeneous region in the virtual memory of a process:
a contiguous range of virtual addresses that have the same permission
flags and are backed up by the same object. 

It corresponds loosely to the concept of a "segment", although it is
better described as a **memory object with its own properties**.

The memory map of a process is made up of at least the following areas:

* `text` --- program's executable
* `data` --- initialized data
* `bss` --- uninitialized data (block started by symbol)
* Program stack
* One area for each active memory mapping

The memory areas of a process can be seen by looking `/proc/<pid>/maps`

---

## Address Spaces
The process address space consists of:

* The virtual memory addressable by a process
* The addresses within the virtual memory that the process is allowed to
  use.

Each process is given a *flat* 32- or 64-bit address space.

* **segmented address space**: with addresses existing not in a single
  linear range, but instead in multiple segments.
* Modern virtual memory OS generally have a flat memory model.


The inverval of legal addresses are called *memory areas*.

Memory areas:

* **text section**: exec file's code
* **data section**: initialized global variable
* **bss section**: uninitialized global variables
* Additional text, data, and bss for each shared library
* memory mapped file
* Shared memory segments
* Anonymous memory mappings.

## The Memory Descriptor
It is associated with each process, recording the memory map of the
process. In the `mm` field of process descriptor.

*memory descriptor* contains all info related to process address space,
represented by `struct mm_struct` in `<linux/mm_types.h>`

```c
struct mm_struct {
    struct vm_area_struct *mmap;     /* list of memory areas */
    struct rb_root mm_rb;            /* red-black tree of VMAs */
    ...
    atomic_t mm_users;               /* address sapce users */
    atomic_t mm_count;               /* primary usage counter */
    ...
};
```



* `mm_users` --- the number of processes using this address
  space.
* `mm_count` --- Primary reference count for the `mm_struct`. If nine
  threads shared an address space, `mm_user` would be nine, but again
  `mm_struct` would be only one. Only when `mm_user` reaches zero is
  `mm_count` decremented. When `mm_count` finally reaches zero, there are
  no remaining references to this `mm_struct`
* `mmap` and `mm_rb` --- different data structures that contain the same
  thing: all the memory areas in this address space. Former is a linked
  list, the latter is a red-black tree.

### Allocating a Memory Descriptor
The memory descriptor associated with a given task is stored in the `mm`
field of the task's process descriptor.

Note: process descriptor is described in `task_struct` of `<linux/sched.h>`

Thus, `current->mm` is the current process's memory descriptor. 

The `copy_mm()` copies parent's memory descriptor to its child during `fork()`

The `mm_struct` is allocated from the `mm_cachep` slab cache via the
`allocate_mm()` macro in `kernel/fork.c`. Normall each process receives a
**unique** `mm_struct` and thus a **unique process address space**.

Process may elect to **share their address spaces with their children** by
means of the `CLONE_VM` flag to `clone()`. The process is then called
`thread`. This is essentially the *only* difference between normal process
and so-called threads in Linux.

In the case `CLONE_VM` is specified, `allocate_mm()` is NOT called, and
the process's `mm` field is set to point to the memory descriptor of its
parent via this logic in `copy_mm()`:

```c
if (clone_flags & CLONE_VM) {
    atomic_inc(&current->mm->mm_users);
    tsk->mm = current->mm;
}
```

### Destroying a Memory Descriptor

When the process associated with a specific address space exits, the
`exit_mm()` defined in `kernel/exit.c`, function is invoked. This function
performs some housekeeping and updates some statistics. It then calls
`mmput()`, which decrement the memory.

If the user count reaches zero, the `free_mm()` macro is invoked to return
the `mm_struct` to the `mm_cachep` slab cache via `kmem_cache_free()`,
because the memory descriptor does not have any users.

### The `mm_struct` and Kernel Threads
The `mm` field of a kernel thread's process descriptor is `NULL`. This is
the *definition* of a kernel thread -- process that have **no user
context**.

To provide kernel threads the needed data, kernel threads use the memory
descriptor or whatever ran previously.

1. Whenever a process is scheduled, the process address space referenced
   by the process's `mm` field is loaded. The `active_mm` field in the
   process descriptor is then updated to refer to the new address space.
* Kernel threads do not have an address space and `mm` is `NULL`.
  Therefore, when a kernel thread is scheduled, the kernel notices that
  `mm` is `NULL` and keeps the previous process's address space loaded.
* The kernel then updates the `active_mm` field of the kernel thread's
  process descriptor to refer to the previous process's memory descriptor.
* The kernel thread can use the previous process's page tables as needed.
* Because kernel threads **do not** access user-space memory, they **make
  use of only the information in the address space pertaining to kernel
  memory**, which is the same for all processes.

## Virtual Memory Areas
The `vm_area_struct` represents memory areas. It is defined in
`<linux/mm_types.h>`. In Linux memory areas are often called `virtual
memory areas` (VMAs)

The `vm_area_struct` describes a **single memory area over a contiguous
interval** in a given address space.

* The kernel treats each VMA as a unique memory object
* Each VMA possesses certain properties, such as permissions and a set of
  associated operations.
* In this manner, VMA can represent **different types of memory areas**.
  For example, the memory-mapping files or the process's user-space stack.

```c
struct vm_area_struct { 
    struct mm_struct *vm_mm;              /* associated mm_struct */
    unsigned long vm_start;               /* VMA start, inclusive */
    unsigned long vm_end;                 /* VMA end , exclusive */
    struct vm_area_struct *vm_next;       /* list of VMA’s */
    pgprot_t vm_page_prot;                /* access permissions */
    unsigned long vm_flags;               /* flags */
    struct rb_node vm_rb;                 /* VMA’s node in the tree */
    union {                               /* links to address_space->i_mmap or i_mmap_nonlinear */
        struct {
            struct list_head list;
            void *parent;
            struct vm_area_struct *head;
        } vm_set;
    struct prio_tree_node prio_tree_node;
    } shared;
    struct list_head anon_vma_node;       /* anon_vma entry */
    struct anon_vma *anon_vma;            /* anonymous VMA object */
    struct vm_operations_struct  *vm_ops; /* associated ops */
    unsigned long vm_pgoff;               /* offset within file */
    struct file *vm_file;                 /* mapped file, if any */
    void *vm_private_data;                /* private data */
};
```

The `vm_start` field is the initial (lowest) in the interval and `vm_end`
is the first byte after the final address. Thus `vm_end - vm_start` is the
length in bytes of the memory area.

Intervals in different memory areas in the same address space cannot
overlap.

The `vm_mm` field points to this VMA's associated `mm_struct`. Note that
each VMA is unique to the `mm_struct` with which it is associated.

Even if two processes map the same file nto their respective address
spaces, each has unique `vm_area_struct` to identify its unique memory
area.

## Mapping Memory Areas
The kernel often has to perform operations on a memory area, such as whether a given 
address exists in a given VMA.These operations are frequent and form the basis of the
`mmap()` routine.

Helper function declared in `<linux/mm.h>`

* `find_vma()` --- searching for the VMA in which a given memory address
  resides. Defined in `mm/mmap.c`. This function searches the given
  address space for the first memory area whose `vm_end` field is greater
  than `addr`.


## Page Tables
Page tables work by splitting the virtual address into chunks. Each chunk
is used as an index into a table. The table points to either another table
nor the associated physical page. 

In Linux, the page tables consist of three level:

* The top-level: **Page Global Directory** (PGD). consists an array of
  `pgd_t` types. (usually an `unsigned long`. The entries in PGD point to
  the entries in the second level PMD
* The second level: **Page Middle Directory** (PMD), an array of `pmd_t`
  types, point to the entries in `PTE`
* The final level is called simply the **page table**  of type `pte_t`.

Kernel set things up, and hardware do the actual look up. Page table data
structure are architecture-dependent and defined in `<asm/page.h>`.

Most processor implement a *translation lookaside buffer*, or TLB.
