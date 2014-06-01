# Machine Level representation of Programs
## Program Encoding
What gcc do:

1. Expand the pre-processors
* Complier generates assembly codes (`*.s`)
* Assembler to object code (`*.o`)
* Linker generates executable code

### Machine Level Code
Two important concepts for programmer

* Instruction set architecture (ISA): The format and behavior of a
  machine-level program.
* Memory addresses used by a machine-level program are virtual addresses.

Processor states:

* The **program counter** (referred as PC, and called `%eip` (instruction
  pointer) in IA32). 
* The integer **register file** contains eight named location storing
  32-bit values. Hold addresses or integer.
* The **condition code registers** hold status information about most
  recently executed arithmetic or logical instruction. 
* A set of **floating-point registers**

### Code example
Compile:

    gcc -O1 -S code.c

Compile and assemble:
    
    gcc -O1 -c code.c

Program actually executed by the machine is simply a sequence of bytes
encoding a series of instructions.

To inspect the contents of machine-code files, a class of programs known
as *disassemblers* can be invaluable, in Linux:

    objdump -d code.o

1. IA32 instructions can range in length from 1 to 15 bytes
* There is a unique decoding of the bytes into machine instructions.

Generating the actual executable code requires running a **linker** on the set
of object-code file

Linker will shift to the addresses of the code into another location. 

In assembly, all the lines with `.` are directives to guide the assembler
and linker.


