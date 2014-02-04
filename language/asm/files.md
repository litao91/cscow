# Dealing with Files
## The UNIX File Concept
UNIX files, no matter what program created them, can all be accessed as a
sequential stream of bytes. When you access a file, you start by opening
it by name. The operating system then gives you a number, called a file
descriptor, which you use to refer to the file until you are through with
it. You can then read and write to the file using its file descriptor.
When you are done reading and writing, you then close the file, which
then makes the file descriptor useless.

## Buffer
Assign buffer with the following command

    .section .bss
    .lcomm my_buffer, 500

The driective `.lcomm` will create a symbol, `my_buffer` that refers to a
500-byte storage location that we can use as buffer. We can then do the
following, assuming we have opened a file for reading and have placed the
file descriptor `%ebx`:

    movl $my_buffer, %ecx
    movl 500, %edx
    movl 3, %eax
    int $0x80

## Using Files in a Program
Illustrate a program that take two files, read from one, convert all of
its lower-case letters to upper-case, and write to other file.

Jobs:

1. A function takes a block of memory and converts it to upper-case
* A section of code that repeated reads in to a buffer
* Begin the program by opening the necessary files

Note:`.equ` allows you to assign names to number



