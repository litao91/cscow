# How does Linux execute main
Example, called `simple.c`.
```c
main() {
    return (0);
}
```

Build

    gcc -o simple simple.c


What's in the exec:

    objdump -f simple

    simple:     file format elf32-i386
    architecture: i386, flags 0x00000112:
    EXEC_P, HAS_SYMS, D_PAGED
    start address 0x080482d0

## ELF
ELF is acronym for **Executable and Linking Format**.

Every ELF executable has ELF header, which is the follow:

```c
typedef struct
{
    unsigned char    e_ident[EI_NIDENT];    /* Magic number and other info */
    Elf32_Half    e_type;            /* Object file type */
    Elf32_Half    e_machine;        /* Architecture */
    Elf32_Word    e_version;        /* Object file version */
    Elf32_Addr    e_entry;        /* Entry point virtual address */
    Elf32_Off    e_phoff;        /* Program header table file offset */
    Elf32_Off    e_shoff;        /* Section header table file offset */
    Elf32_Word    e_flags;        /* Processor-specific flags */
    Elf32_Half    e_ehsize;        /* ELF header size in bytes */
    Elf32_Half    e_phentsize;        /* Program header table entry size */
    Elf32_Half    e_phnum;        /* Program header table entry count */
    Elf32_Half    e_shentsize;        /* Section header table entry size */
    Elf32_Half    e_shnum;        /* Section header table entry count */
    Elf32_Half    e_shstrndx;        /* Section header string table index */
} Elf32_Ehdr;
```

## What's at address `0x080482d0`, the starting addr

Disassemble simple:

    objdump --disassemble simple

The output:

    080482d0 <_start>:
    80482d0:       31 ed                   xor    %ebp,%ebp
    80482d2:       5e                      pop    %esi
    80482d3:       89 e1                   mov    %esp,%ecx
    80482d5:       83 e4 f0                and    $0xfffffff0,%esp
    80482d8:       50                      push   %eax
    80482d9:       54                      push   %esp
    80482da:       52                      push   %edx
    80482db:       68 20 84 04 08          push   $0x8048420
    80482e0:       68 74 82 04 08          push   $0x8048274
    80482e5:       51                      push   %ecx
    80482e6:       56                      push   %esi
    80482e7:       68 d0 83 04 08          push   $0x80483d0
    80482ec:       e8 cb ff ff ff          call   80482bc <_init+0x48>
    80482f1:       f4                      hlt    
    80482f2:       89 f6                   mov    %esi,%esi

Some kind of routine `_start` is at the starting address.

What it does is *clear a register*, *push some values into stack* and
*call a function*.

The stack frame should look like this:

    -------------------
    0x80483d
    -------------------
    esi
    -------------------
    ecx
    -------------------
    0x8048274
    -------------------
    0x8048420
    -------------------
    edx
    -------------------
    esp
    -------------------
    eax
    -------------------

Some addresses:
* `0x80483d0`: the address of the `main()` function
* `0x8048274`: `_init` function (initialization)
* `0x8048420`: `fini` function  (finalization)

## More about ELF and dynamic linking
Linked dynamically: linking process happens at runtime.

If you issue command:

    "ldd simple"

          libc.so.6 => /lib/i686/libc.so.6 (0x42000000)
          /lib/ld-linux.so.2 => /lib/ld-linux.so.2 (0x40000000)

Concept:

1. We don't know actual addr.\ at link time. We can know the **actual
   address of the symbol** only at runtime.
* For dynamic symbol, we reserve a memory location for the actual address.
* Our application sees the dynamic symbol indirectly with the memory
  location by using kind of pointer operation. In our case, the address at
  `0x8042bc`, there is just a simple jump instruction.
  We can see all dynamic link entries with `objdump`


## What's `__libc_start_main`

The prototype look like this:

    extern int BP_SYM (__libc_start_main) (int (*main) (int, char **, char **),
                    int argc,
                    char *__unbounded *__unbounded ubp_av,
                    void (*init) (void),
                    void (*fini) (void),
                    void (*rtld_fini) (void),
                    void *__unbounded stack_end)
    __attribute__ ((noreturn));

What this function does is setup/initialize some data
structures/environments and call our `main()`

The stack frame with this function prototype:

        -------------------
        0x80483d0                              main
        ------------------- 
        esi                                    argc
        ------------------- 
        ecx                                    argv 
        ------------------- 
        0x8048274                              _init
        ------------------- 
        0x8048420                              _fini
        ------------------- 
        edx                                    _rtlf_fini
        ------------------- 
        esp                                    stack_end
        ------------------- 
        eax                                    this is 0
        ------------------- 

`esi`, `ecx`, `edx`, `esp`, `eax` registers should be filled with
appropriate values before `__libc_start_main()` is executed.

## What does the kernel do?
When we exec a program by entering a name:

1. The shell calls the kernel system call `execve` with `argc/argv`
* The kernel system call handler gets control and start handling the
  system call. In the kernel code, the handler is `sys_execve`. On x86,
  the user-mode application passes all required parameter to kernel with 
    * `ebx`: pointer to program name string
    * `ecx`: `argv` array pointer
    * `edx`: environment variable array pointer
* The generic execve kernel system call handler, which is `do_execve`    ,
  is called. What it does is set up a data structure and copy some data
  from user space to kernel space and finally calls
  `search_binary_handler()`.

When the `_start` assembly instruction gets control of execution, the stack frame looks like this. 

    Stack Top      -------------
                       argc
                   -------------
                       argv pointer
                   -------------
                       env pointer
                   ------------- 

And the assembly instructions gets all information from stack by:

    pop %esi            <--- get argc
    move %esp, %ecx     <--- get argv
                  actually the argv address is the same as the current
                  stack pointer.


## Summing up

Here is what happens. 

1. GCC build your program with `crtbegin.o/crtend.o/gcrt1.o`. And the
   other default libraries are dynamically linked by default. Starting
   address of the executable is set to that of `_start`.
* Kernel loads the executable and setup `text/data/bss/stack`, especially,
  kernel allocate page(s) for arguments and environment variables and
  pushes all necessary information on stack.
* Control is pased to `_start`. `_start` gets all information from stack
  setup by kernel, sets up argument stack for `__libc_start_main`, and calls
  it. 
* `__libc_start_main` initializes necessary stuffs, especially C
  library(such as `malloc`) and thread environment and calls our main. 
