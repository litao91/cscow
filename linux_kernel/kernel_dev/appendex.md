# Global Descriptor Table (GDT)
A data structure used by Intel X86 family. In order to define the
characteristics of the various memory areas used during program execution. Including:
* Base address
* Size
* access privileges.

These memory are called *segments*.

GDT can hold things other than *segment descriptor*.
Every 8-byte entry in the GDT is a descriptor. They can be 
* Task State Segment(TSS) 
* Local Descriptor
* Call Gate Descriptor

The LDT is supposed to contain memory segments which are private to a
specific program while GDT is suppose to contain global segments.

In order to reference a segment, a program must use its index inside the
GDT or LDT. Such an index is called a *segment selector*. 

The selector must generally be loaded into a segment register to be used. 

# TSS (Task State Segment)
It saves the register value of different privilege level. 

On context switching, 

# x86 Calling conventions
Calling conventions describe the interface of called code:
* The order in which atomic parameters, or individual parts of a complex
  parameter, are allocated
* How parameters are passed (pushed on the stack, placed in register or
  mix
* which registers the callee must preserve for the caller. 
* How the task of preparing the stack for, and restoring after, a function
  call is divided between the caller and callee.

## Caller clean-up
### codecl
The cdecl (C declaration) is a calling convention that originates from the
C programming language and is used by many C compilers for the x86
architercutre. 

In cdecl,  
* subroutine arguments are passed on the stack
* Integer values and memroy address are returned in the `EAX` register,
  floating points in the `ST0` x87 register. 
* `EAX`, `ECX`, and `EDX` are caller-saved, and the rest are callee-saved.
* x87 floating point registers `ST0` to `ST7` must be empty when calling a
  new function. And `ST1` to `S17` must be empty on existing a function. 

In context of the C programming language, function arguments are pushed on
the stack in the *reverse order*
