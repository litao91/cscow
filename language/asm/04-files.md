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

Code:


    .section .data

    ######CONSTANTS ###########
    # system call numbers
    .equ SYS_OPEN, 5
    .equ SYS_WRITE, 4
    .equ SYS_READ, 3
    .equ SYS_CLOSE, 6
    .equ SYS_EXIT, 1

    # options for open
    .equ O_RDONLY, 0
    .equ O_CREATE_WRONLY_TRUNC, 03101

    # standard file descriptors
    .equ STDIN, 0
    .equ STDOUT, 1
    .equ STDERR, 2

    # system call interrupt
    .equ LINUX_SYSCALL, 0x80
    .equ END_OF_FILE, 0
    .equ NUMBER_ARGUMENTS, 2

    .section .bss
    #Buffer - this is where data loaded into from data file
    #         This should never exceed 16,000 for various reasons
    .equ BUFFER_SIZE, 500
    .lcomm BUFFER_DATA, BUFFER_SIZE

    .section .text
    #STACK_POSITIONS
    .equ ST_SIZE_RESERVE, 8
    .equ ST_FD_IN, -4
    .equ ST_FD_OUT, -8 
    .equ ST_ARGC, 0    # Number of arguments
    .equ ST_ARGV_0, 4  # Name of program
    .equ ST_ARGV_1, 8  # Input file name
    .equ ST_ARGV_2, 12 # Output file name

    .globl _start
    _start:

    ### INITIALIZE PORGRAM ###
    # save the stack pointer
    movl %esp, %ebp
    # allocate space for our file descriptors on the stack
    subl $ST_SIZE_RESERVE, %esp # move down stack pointer

    ######### Open file descriptors ##############
    open_files:
    open_fd_in:
    ### OPEN INPUT FILE ###
    #open syscall
    movl $SYS_OPEN, %eax
    movl ST_ARGV_1(%ebp), %ebx
    #read-only flag
    movl $O_RDONLY, %ecx
    # doesn't matter for reading
    movl $0666, %edx
    # call Linux
    int $LINUX_SYSCALL

    store_fd_in:
    # save the given file descriptor
    movl %eax, ST_FD_IN(%ebp)

    open_fd_out:
    ### OPEN OUTPUT FILE###
    # open the file
    movl $SYS_OPEN, %eax
    #output file name into %ebx
    movl ST_ARGV_2(%ebp), %ebx
    #flags for writing the file
    movl $O_CREATE_WRONLY_TRUNC, %ecx
    #mode for new file
    movl $0666, %edx
    int $LINUX_SYSCALL

    store_fd_out:
    movl %eax, ST_FD_OUT(%ebp)


    ### Read file, convert to upper and write
    read_loop_begin:

    ### READ IN A BLOCK FROM THE INPUT FILE###
    movl $SYS_READ, %eax
    # get the input file descriptor
    movl ST_FD_IN(%ebp), %ebx
    # the location to read into
    movl $BUFFER_DATA, %ecx
    # the size of the buffer
    movl $BUFFER_SIZE, %edx
    # Size of buffer read is returned in %eax
    int $LINUX_SYSCALL

    ### EXIT IF WE'VE REACHED THE END###
    cmpl $END_OF_FILE, %eax
    # if found or on error, go to the end
    jle end_loop

    continue_read_loop:
    pushl $BUFFER_DATA #location of buffer
    pushl %eax #size of the buffer
    call convert_to_upper
    popl %eax # get the size back
    addl $4, %esp

    ### WRITE THE BLOCK OUT TO THE OUTPUT FILE
    # size of the buffer
    movl %eax, %edx
    movl $SYS_WRITE, %eax
    # file to use
    movl ST_FD_OUT(%ebp), %ebx
    # location of the buffer
    movl $BUFFER_DATA, %ecx
    int $LINUX_SYSCALL

    ###CONTINUE THE LOOP###
    jmp read_loop_begin

    end_loop:
    ###CLOSE THE FILES###
    movl $SYS_CLOSE, %eax
    movl ST_FD_OUT(%ebp), %ebx
    int $LINUX_SYSCALL

    movl $SYS_CLOSE, %eax
    movl ST_FD_IN(%ebp), %ebx
    int $LINUX_SYSCALL

    ### EXIT ###
    movl $SYS_EXIT, %eax
    movl $0, %ebx
    int $LINUX_SYSCALL


    ### Function to convert the input to upper case
    # VARIABLES:
    # %eax -- beginning of the buffer
    # %ebx -- length of the buffer
    # %edi -- current buffer offset
    # %cl -- current byte being examined

    ### CONSTANTS
    .equ LOWERCASE_A, 'a'
    .equ LOWERCASE_Z, 'z'
    .equ UPPER_CONVERSION, 'A' - 'a'

    ### STACK STUFF
    .equ ST_BUFFER_LEN, 8
    .equ ST_BUFFER, 12 

    convert_to_upper:
    pushl %ebp
    movl %esp, %ebp

    ### SET UP VARIABLES
    movl ST_BUFFER(%ebp), %eax # the beginning addr of the buffer
    movl ST_BUFFER_LEN(%ebp), %ebx # the length of the buffer
    movl $0, %edi

    # if a buffer with zero length was given, just leave.
    cmpl $0, %ebx
    je end_convert_loop

    convert_loop:
    movb (%eax, %edi, 1), %cl # move byte

    # go to the next byte unless it is between 'a' and 'z'
    cmpb $LOWERCASE_A, %cl
    jl next_byte # jump if second var is less than first
    cmpb $LOWERCASE_Z, %cl
    jg next_byte

    # otherwise convert to upper
    addb $UPPER_CONVERSION, %cl
    # store it back
    movb %cl, (%eax, %edi, 1)

    next_byte:
    incl %edi
    cmpl %edi, %ebx #continue unless end
    jne convert_loop

    end_convert_loop:
    # no return val, just leave
    movl %ebp, %esp
    popl %ebp
    ret
