# Functions
## How Functions Work
Functions are composed of several different pieces:

* Function name
* Function parameters
* Local variables
* Static Variables: static variables are data storage that a function uses
  while processing that is not thrown away afterwards, but is reused for
  every time the function's code is activated.
* Global Variables
* Return address: the return address is an "invisible" parameter in that
  it isn't directly used during the function. The return address is a
  parameter which tells the function where to resume executing after the
  function is completed.
* return value.

**Calling Convention**: the way that the variables are stored and
parameters and return values are transferred by the computer. It describes
how functions expected to get and receive data when they are called.

## Assembly-Language Functions using the C Calling Convention
The stack register, `%esp`, always contains a pointer to the current top
of the stack.

Every time we push something onto the stack with `pushl, %esp` gets
subtracted by 4 so that it points to the new top of the stack (each word
is for bytes long, and stack grows downward).

If we want to remove something from the stack, we simply use the `popl`
instruction, which adds 4 to `%esp` and puts the previous top value in
whatever register you specified.

If we simply want to access the value on the top of the stack without
removing it, we can simply use the `%esp` register in indirect addressing
mode:

    movl (%esp), %eax

In the C calling convention, the stack is the key element for implementing
a function's local variables, parameters and return address.

1. Before executing a function, a program pushes all of the parameters for
   the function onto the stack in the reverse order that they are
   documented.
* Then the program issues a call instruction indicating which function it
  wishes to start. The call instruction does two things. 
    - First it pushes the address of the next instruction, which is the
      return address, onto the stack. 
    - Then it modifies the instruction pointer (`%eip`) to point to the
      start of the function.

The stack will look like this when function start:

    Parameter #N
    ...
    Parameter 2
    Parameter 1
    Return Address <--- (%esp)

Now the function itself has some work to do:

1. Save the **current** base pointer register `%ebp`. By doing `pushl %ebp`.
   The base pointer is a special register used for accessing function
   parameters and local variables.
* Copy the stack pointer to `%ebp` by doing `movl %esp, %ebp`. Allows you
  to access the function parameters as fixed indexes from base pointer.
  `%ebp` will always be where the stack pointer was at the beginning of
  the function, so it is more or less a constant reference to the *stack
  frame*

  At this point, the stack looks like this:

        Parameter #N   < --- N*4+4(%ebp)
        ...
        Parameter 2    < --- 12(%ebp)
        Parameter 1    < --- 8(%ebp)
        Return Address < --- 4(%ebp)
        Old %ebp       < --- (%esp) and (%ebp)

* The function reserves space on the stack for any local variables it
  needs. Simply move the stack pointer down:

        subl $8, %esp

  Now the stack look like this:

        Parameter #N     < --- N*4+4(%ebp)
        ...
        Parameter 2      < --- 12(%ebp)
        Parameter 1      < --- 8(%ebp)
        Return Address   < --- 4(%ebp)
        Old %ebp         < --- (%ebp)
        Local Variable 1 < --- -4(%ebp)
        Local Variable 2 < --- -8(%ebp) and (%esp)

  You can use other registers in base pointer, but x86 makes using `%ebp`
  a lot faster.


When a function is done executing, it does three things:

1. It stores it's return value in `%eax`
* Resets the stack to what it was when it was called.
* It returns control back to wherever it was called from. This is done
  using the `ret` instruction, which pops whatever value is at the top of
  the stack, and sets the instruction pointer, `%eip`, to that value.

Therefore to return from the function, you have to do the following:

    movl %ebp, %esp
    popl %ebp
    ret

Control has now been handed back to the calling code, which can now
examine `%eax` for the return value.

When you call a function, you should assume that everything currently in
your registers will be wiped out. The only register that is guaranteed to
be left is `%ebp`. `%eax` is guaranteed to be overwritten. You need to
save them by pushing them on the stack before pushing the function's
parameter.

## A function example

    .section .data

    .section .text

    .globl _start
    _start:
    pushl $3        # second argument
    pushl $2        # first argument
    call power
    addl $8, %esp   # move the stack pointer back

    pushl %eax      # save the first answer (returned in %eax)

    pushl $2        # second argumetn
    pushl $5        # first argument
    call power
    addl $8, %esp   # move stack pointer back

    popl %ebx       # the first answer is in stack

    addl %eax, %ebx

    movl $1, %eax   # exit (%ebx is returned)
    int $0x80


    # VARIABLES:
    # %ebx - the base number
    # %ecx - the power
    .type power, @function
    power:
    pushl %ebp           # save old base pointer
    movl %esp, %ebp      # make new base pointer
    subl $4, %esp        # get room for local storage

    movl 8(%ebp), %ebx   # put first argumetn in %eax, note 4(%ebp) is r addr
    movl 12(%ebp), %ecx  # put second argument in %ecx

    movl %ebx, -4(%ebp)  # store the current result

    power_loop_start:
    cmpl $1, %ecx        # if the power is 1, we are done
    je end_power

    movl -4(%ebp), %eax  # move the current result to eax
    imull %ebx, %eax     # multiply the current result by the base num
    movl %eax, -4(%ebp)  # store the current result
    decl %ecx
    jmp power_loop_start
    end_power:
    movl -4(%ebp), %eax  # return value goes to %eax
    movl %ebp, %esp      # restore the stack pointer
    popl %ebp            # restore the base pointer
    ret

Look at how the function itself is written. We first have the following
line:

    .type power, @function

This tells the liner that the symbol `power` should be treated as a
function. After that we define the value of `power` label:

    power:

This is how `call power` works. It transfers control to this spot of the
program. The different between `call` and `jmp` is that `call` also pushes
the return address onto the stack so that the function can return.

Next, we have instructions to set up our function

    pushl %ebp
    movl %esp, %ebp
    subl $4, %esp

Basically, what the program does is start with the base number, and store
it both as the multiplier (stored in `%ebx`) and the current value (in
`-4(%ebp)). It also has the power stored in `%ecx`. It then continually
multiplies the current value by the multiplier, decreases the power, and
leave the loop if the power gets down to 1.

## Recursive functions
Sample code for calculating factorial:


# Recursive calculate factorial

    .section .data
    .section .text

    .globl _start
    .globl factorial

    _start:
    pushl $4
    call factorial
    addl $4, %esp
    movl %eax, %ebx
    movl $1, %eax
    int $0x80

    .type factorial, @function
    factorial:
    pushl %ebp
    movl %esp, %ebp
    movl 8(%ebp), %eax
    cmpl $1, %eax
    je end_factorial

    decl %eax
    pushl %eax
    call factorial
    movl 8(%ebp), %ebx
    imull %ebx, %eax

    end_factorial:
    movl %ebp, %esp
    popl %ebp
    ret

Note: The `.type` directive tells the linker that `factorial` is a function.
This isn't really needed unless we were using factorial in other programs.

