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

