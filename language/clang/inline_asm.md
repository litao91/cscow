# Inline assembly for x86 in Linux
## GNU assembler syntax in brief
**Source and destination ordering**: source first and destination follows:
    
    movl %eax, %ebx

**Size of operand**: suffixed by `b`, `w`, `l` for byte, word and long
respectively. 

    movb %al, %bl -- Byte move
    movw %ax, %bx -- word move
    movl %eax, %ebx -- Longword move

**Immediate operand**: An immediate operand is specified by using `$`:

    movl $0xffff, %eax -- move value of 0xffff to eax register

**Indirect memory reference**: Done by using `()`

    movb (%esi), %al -- transfer the byte pointed by esi to al

## Inline Assembly
The `asm` keyword allows you to embed assembler instructions within C
code. 

You can read and write C variables from assembler and perform jumps from
assembler code to C labels.

     asm [volatile] ( AssemblerTemplate : [OutputOperands] [ : [InputOperands] [ : [Clobbers] ] ] )
     asm [volatile] goto ( AssemblerTemplate : : [InputOperands] : [Clobbers] : GotoLabels )

To create headers compatible with ISO C, with `__asm__` instead of `asm`
and `__volatile__` instead of volatile.

* `volatile` Disable certain optimization
* `goto` informs the compiler that the asm statement may perform a jump to
  one of the labels listed in the GotoLables section.

### Parameters
* **AssemblerTemplate**: the assembler code. A combination of *fixed text*
  and *tokens* that refer to the input, output and goto parameters.
* **OutputOperands**: comma-separated list of the C variables **modified** by
  the instructions in the AssemblerTemplate.
* **InputOperands**: A comma-separated list of C expressions read by the
  instructions in the AssemblerTemplate.
* **Clobbers**: A comma-separated list of registers or other values
  changed by the AssemblerTemplate, beyond those listed as outputs
* **GotoLabels**: When you are using the goto form of asm, this section
  contains the list of all C labels to which the AssemblerTemplate may
  jump

### Remarks
Think of an `asm` statement as a series of low-level instructions that
convert input parameters to output parameters.

Example:

```c
int src = 1;
int dst;

asm ("mov %1, %0\n\t"
    "add $1, %0"
    : "=r" (dst)
    : "r" (src));

printf("%d\n", dst);
```
This code will copy `src` to `dst` and add 1 to `dst`.

### Assembler Template
An assembler template is a literal string containing assembler
instructions. The compiler will replace any references to inputs, outputs,
and goto labels in the template, and then output the resulting string to
the assembler. 

GCC does not parse the assembler instructions themselves and does not know
what they mean or even whether they are valid assembler input.

You may place multiple assembler instructions together in a single asm
string, separated by the characters normally used in assembly code for the
system.

Accessing data from C programs without using input/output operands (such
as by using global symbols directly from the assembler template) may not
work as expected. Similarly, calling functions directly from an assembler
template requires a detailed understanding of the target assembler and
ABI.

* `%%` outputs a single `%` into the assembler code
* `%=` outputs a number that is unique to each instance of the `asm`
  statement in the entire compilation.


### Output Operands
An asm statement has zero or more output operands indicating the names of
C variables *modified* by the assembler code.

In this example, `old` (referred to in the template string as `%0` and
`*Base` (as `%1`) are outputs and `Offset` (`%2`) is an input:

```c
bool old;

__asm__ ("btsl %2,%1\n\t" // Turn on zero-based bit #Offset in Base.
         "sbb %0,%0"      // Use the CF to calculate old.
   : "=r" (old), "+rm" (*Base)
   : "Ir" (Offset)
   : "cc");

return old;
```

Operands use this format

    [ [asmSymbolicName] ] "constraint" (c_variable_name) asmSymbolicName 

#### asmSymbolicName
When not using `asmSymbolicNames`, use the zero-based position of the
operand in the list of operands in the assembler template. 

Example, if there are three output operands, `%0` for the first, `%1` for
the second and `%2` for the third.

When using an `asmSymbolicName`, reference it by enclosing the name in
square brackets `%[Value]`.

#### Constraint
Begin with either:
* `=` a variable overwriting an existing value, when using `=`, do not
  assume the location will contain the existing value.
* `+` when reading and writing.

After the prefix, there must one or more additional constraints that
describe *where the value resides*. Common constrains:

* `r` for register
* `m` for memory

If you list more than one (e.g., `=rm`), the compiler chooses the most
efficient one.

#### cvariablename
The C variable name of the output (enclosed by parentheses), accepts any
non-constant variable within scope.

#### Examples
This code makes no use of the optional asmSymbolicName. Therefore it references the first output operand as %0 (were there a second, it would be %1, etc). The number of the first input operand is one greater than that of the last output operand. In this i386 example, that makes Mask %1:

     uint32_t Mask = 1234;
     uint32_t Index;
     
       asm ("bsfl %1, %0"
          : "=r" (Index)
          : "r" (Mask)
          : "cc");

That code overwrites the variable Index ("="), placing the value in a register ("r"). The generic "r" constraint instead of a constraint for a specific register allows the compiler to pick the register to use, which can result in more efficient code. This may not be possible if an assembler instruction requires a specific register.

The following i386 example uses the asmSymbolicName operand. It produces the same result as the code above, but some may consider it more readable or more maintainable since reordering index numbers is not necessary when adding or removing operands. The names aIndex and aMask are only used to emphasize which names get used where. It is acceptable to reuse the names Index and Mask.

     uint32_t Mask = 1234;
     uint32_t Index;
     
       asm ("bsfl %[aMask], %[aIndex]"
          : [aIndex] "=r" (Index)
          : [aMask] "r" (Mask)
          : "cc");

Here are some more examples of output operands.

     uint32_t c = 1;
     uint32_t d;
     uint32_t *e = &c;
     
     asm ("mov %[e], %[d]"
        : [d] "=rm" (d)
        : [e] "rm" (*e));

Here, d may either be in a register or in memory. Since the compiler might already have the current value of the uint32_t pointed to by e in a register, you can enable it to choose the best location for d by specifying both constraints.

### Input Operands
Input operands make inputs from C variables and expressions available to
the assembly code.

Format:

    [ [asmSymbolicName] ] "constraint" (cexpression)

#### Constraints
Input constraints must be a string containing one or more constraints. 
Input constrains may NOT begin with either `=` or `+`.

#### cexpression
The C variable or expression being passed to the `asm` statement as input.

If there are no output operands but there are input operands, place two
consecutive colons where output operands would go.

     __asm__ ("some instructions"
        : /* No outputs. */
        : "r" (Offset / 8);

#### Examples
In this example using the fictitious combine instruction, the constraint "0" for input operand 1 says that it must occupy the same location as output operand 0. Only input operands may use numbers in constraints, and they must each refer to an output operand. Only a number (or the symbolic assembler name) in the constraint can guarantee that one operand is in the same place as another. The mere fact that foo is the value of both operands is not enough to guarantee that they are in the same place in the generated assembler code.

     asm ("combine %2, %0"
        : "=r" (foo)
        : "0" (foo), "g" (bar));
Here is an example using symbolic names.

     asm ("cmoveq %1, %2, %[result]"
        : [result] "=r"(result)
        : "r" (test), "r" (new), "[result]" (old));

### Clobbers
The assembler code may modify more than just the outputs. e.g.,
calculations may overwrite a register as a side effect of a particular
assembler instruction. In order to inform the compiler of these changes,
list them in the clobber list.

Clobber list itmes are either register names or special clobbers.
