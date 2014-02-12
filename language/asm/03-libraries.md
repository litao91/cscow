# Libraries
Dependency problems:

* If multiple applications are all using the shared file, how do we know
  when it is safe to delete the file?
* Some program inadvertently rely on bugs within shared function.
  Therefore, if upgrading the shared program fixes a bug that a program
  depended on, it could cause that application to cease functioning.

These problems are what lead to what is known as "DLL hell".

In programming, shared code files are referred to as *shared libraries*,
*shared objects*, *dynamic-link libraries*, *DLLs*, or *.so files*. We
will refer to them as *shared libraries*

## Using a Shared Library
The regular helloworld program look like this:


    # Writes message "hello world" and exits
    .include "linux.s"
    .section .data
    helloworld:
    .ascii "helloworld\n"
    helloworld_end:

    .equ helloworld_len, helloworld_end - helloworld

    .section .text
    .globl _start
    _start:
    movl $STDOUT, %ebx
    movl $helloworld, %ecx
    movl $helloworld_len, %edx
    movl $SYS_WRITE, %eax
    int $LINUX_SYSCALL

With library:


    .section .data
    helloworld:
    .ascii "hello world\n\0"

    .section .text
    .globl _start
    _start:
    pushl $helloworld
    call printf

    pushl $0
    call exit

To build the second program:

    as helloworld-lib.s -o helloworld-lib.o
    ld -dynamic-linker /lib/ld-linux.so.2 \
       -o helloworld-lib helloworld-lib.o -lc

The option `-dynamic-linker /lib/ld-linux.so.2` allows our program to be
linked to libraries. Dynamic linker is basically another program in linux,
the os will load the program `ld-linux.so.2`, and `ld-linux` will then
load the external libraries and link them with the program.

The `-lc` option says to link the `c` library, named `libc.so` on
GNU/Linux systems. 

Given a library name, `c` in this case, the GNU/Linux linker prepends the
string `lib` to the beginning of the library name and appends `.so` to the
end of it to find from the library's filename.

Notice that the symbols `printf` and `exit` are simply referred by name
within the program. In previous chapters, the linker will resolve all of
the names to physical addresses, and the names would be thrown away. 

When using **dynamic linking**, the name itself resides within the
executable, and is resolved by the dynamic linker when it is run.

When the program is run by the user, 

1. the dynamic linker loads the shared libraries listed in our link
   statement, and 
* then finds all of the function and variable names that were named by our
  program but not found at link time, and 
* matches them up with corresponding entries in the shared libraries it
  loads. 
* It then replaces all of the names with the addresses which they are
  loaded at. 


## How shared libraries work
All of the code was contained within the source file, such programs are
called *statically-linked executables*, because they contained all of the
necessary functionality for the program that wasn't handled by the kernel.

We used both main program file and files containing routines used by
multiple programs. In this case, we combined all of the code together
using the linker at link-time, so it was still statically-linked.

However, the `helloworld-lib` program, we started using shared libraries.
When you use shared libraries, your program is then *dynamically-linked*,
which means that **not all of the code needed to run the program is
actually contained within the program file itself, but in external
libraries**.

1. When we put `-lc` on the command to link the `helloworld` program, it
   told the linker to use the `c` library (`libc.so`) to look up any
   symbols that weren't already defined in `helloworld.o`. It just notes
   in the program where to look. 
* When the `helloworld` begins, the file `/lib/ld-linux.so.2` is loaded
  first. This is the dynamic linker. 
* The dynamic linker looks at our `helloworld` program and sees that it
  needs the `c` library to run. 
* So it searches for the file called `libc.so` in the standard places
  (listed in `/etc/ld.so.conf` and in the contents of the
  `LD_LIBRARY_PATH` environment variable)
* then looks in the library for all the needed symbols (`printf` and
  `exit` in this case), and then loads the library into the program's
  virtual memory.
* Finally, it replaces all instances of `printf` in the program with the
  actual location of `printf` library.

Run the following command:

    ldd ./helloworld-nolib

It should report back `not a dynamic executable`

    ldd ./helloworld-lib

It will report something like:

    libc.so.6 => /lib/libc.so.6 (0xf7554000)
    /lib/ld-linux.so.2 (0xf7737000)

This means that the program `helloworld` is linked to `libc.so.6` (the
`.6` is the version number).

Note: 
* You always push a functions parameters in reverse order. Because
  parameter pushed in last will be in a known position relative to the top
  of the stack. This is for functions that accept variable number of
  parameters.

## Finding information about libraries
Most of your system libraries are in `/usr/lib` or `/lib`. If you want to
just see what symbols they define, run:
    
    objdump -R FILENAME

## Building a Shared Library
Let's say we now have two source files `write-record.s` and
`read-record.s` and we want to build them into a shared library.

The first thing we do is assemble them like normal:

    as write-record.s -o write-record.o
    as read-record.s -o read-record.o

Now, instead of linking them into a program, we want to link them into a
shared library:

    ld -shared write-record.o read-record.o -o librecord.so

This links both of these files together into a shared library
`librecord.so`.

How we now use the program:

    as write-records.s -o write-records
    ld -L . -dynamic-linker /lib/ld-linux.so.2 \
       -o write-records -lrecord write-records.o

In this command: 
* `-L .` told the linker to **look for libraries in the current
  directory**.
* `-dynamic-linker /lib/ld-linux.so.2` specified the dynamic linker
* The option `-lrecrod` tells the linker to search for functions in the
  file named `librecord.so`.

Now the `write-records` program is built, but it will not run. If we try
it, we will get error like following:

    ./write-records: error while loading shared libraries:
    librecord.so: cannot open shared object file: No such
    file or directory

This is because by default, the dynamic linker only searches `/lib`,
`/usr/lib`, and whatever directories that are in `/etc/ld.so.conf`

You should either add the current library to one of these directories or
set the environment variable:

    LD_LIBRARY_PATH=.
    export LD_LIBRARY_PATH



