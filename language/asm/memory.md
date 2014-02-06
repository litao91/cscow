# Intermediate Memory Topics
## How a Computer Views Memory
Normally numeric data is operated on a word at a time. Instructions are
also stored in memory. Each instruction is a different length. Most
instructions take up one or two storage locations for the instruction
itself, and then storage locations for the instruction's arguments. For
example:
    
    movl data_items (, %edi, 4), %ebx

Takes up to 7 storage locations. 

* The first two hold the instruction
* the third one tells which registers to use
* the next four hold the storage location of `data_items`

Some terms:

* **Word**: the size of a normal register. On X86, a word is four bytes. Most
  computer operations handle a word at a time.
* **Address**: number that refer to a **byte** in memory.
  Normally we don't type numeric address of anything, but we let the
  assembler do it for us. *When we use labels in code, the symbol used in
  the label will be equivalent to the address it is labelling*. The
  assembler will then *replace that symbol with its address wherever you
  use it in your program*.


## Memory Layout of a Linux Program
When your program is loaded into memory:

* `.section` is loaded into its own region of memory.
* The actual instructions (`.text` section) are loaded at the address
  `0x08048000`
* The `.data` section is loaded immediately after `.text`, followed by the
  `.bss` section.


The last byte that can be addressed on Linux is location `0xbfffffff`.
Linux starts the stack here, the initial layout of the stack is as
follows:

* At the bottom of the stack (highest), there is a word of memory that is
  zero.
* After that comes the null-terminated name of the program using ASCII
  characters.
* After the program name comes the program's environment variables
* Then come the program's command-line arguments.
* After these, we have the number of arguments that were used. Then the
  program begins, this is where the sack pointer `%esp` is pointing.

Pushes on stack move `%esp` down in memory. For example:

    pushl %eax

is equivalent to:

    movl %eax, (%esp) # put value to currently pointed to
    subl $4, %esp     # move down

Your program's data region starts at the bottom of memory and goes up. The
stack starts at the top of the memory and moves downward with each push.
This middle part between the stack and your program's data section is
inaccessible memory. 

The last accessible memory address to your program is called the *system
break*

The layout as follows

    0xbfffffff
    | ------------------------ |
    | Environment Variables    |
    | ------------------------ |
    | ...                      |
    | ------------------------ |
    | Arg #2                   |
    | ------------------------ |
    | Arg #1                   |
    | ------------------------ |
    | Program name             |
    | ------------------------ |
    | # of args                | <- %esp
    | ------------------------ |
    | Unmapped Memory          |
    | ------------------------ | <- Break
    | Program Code and Data    |
    | ------------------------ |
    0x08048000

## Virtual Memory
Before loading your program, Linux finds an empty physical memory space
large enough to fit your program, and then tells the processor to pretend
that this memory is actually at the address `0x0804800` to load your
program into.

*mapping*: assigning virtual addresses to physical address.

Overview of the way memory accesses are handled under linux:

* The program tries to load memory from a virtual address.
* The processor, using tables supplies by Linux, transforms the virtual
  memory address into a physical memory address on the fly.
* If the processor does not have a physical address listed for the memory
  address, it sends a request to Linux to load it.
* Linux looks at the address. If it is mapped to a disk location, it
  continues on to the next step. Otherwise, it terminates the program with
  a segmentation fault.
* If there is not enough room to load the memory from disk, Linux will
  move another part of the program or another program onto disk to make
  room.
* Linux then moves data into a free physical memory address. 
* Linux updates the processor's virtual-to-physical memory mapping tables
  to reflect the changes.
* Linux restores control to the program, causing it to re-issue the
  instruction which caused this process to happen.

Memory is separated out into groups called *pages*. All of the memory
mappings are done a page at a time. 

## Getting More Memory
Linux has a facility to move the break point to accommodate an
application's memory needs.

If you need more memory, you just tell Linux where you want the new break
point to be, and Linux will map all the memory you need between the
current and new break point, and then move the break point to the spot you
specify.

The way tell Linux to move the break point is through `brk` system call.
The `brk` system call is call number 45 (in `%eax`). `%ebx` should be
loaded with the requested breakpoint. Then you call `int $0x80` to signal
Linux to do its work. After mapping in your memory, Linux will return the
new break point in `%eax`.





