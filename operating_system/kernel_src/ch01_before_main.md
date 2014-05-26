# 从开机加电到执行`main()`函数之前的过程
## Boot from `BIOS`
CPU hardware logic, on power up, set: 

* `CS` (code segment register): `0xF000` (`1111 0000 0000 0000`)
* `IP` (instruction pointer): `0xFFF0` (`1111 1111 1111 1111`)
* `CS:IP`: `0xFFFF0` (`0000 0000 0000 1111 : 1111 1111 1111 1111`)

Then `CS:IP` `0xFFFF0` is a place in **BIOS**, it's the first instruction
to be executed.

### BIOS setup interrupt vector and interrupt Handler
* Interrupt vector: the memory address of an interrupt handler
* Interrupt vector table: an array contains the memory addresses of
  interrupt handlers

BIOS setup in memory:

* `0x00000` - `0x003FF` (0-1023, 1KB) Interrupt vector table
* `0x00400` - `0x004FF` (1024-1279, 256B) BIOS data region
* `0x0E05B` (57435, about 57KB after previous) about 8KB of interrupt
  handler

## PART I: bootsect (boot sector)
`bootsect` basically loads itself, `setup` and `system`

The memory organization:
* `BOOTSEG = 0x07c0` original address of boot-sector
* `INITSEG = 0x90000` boot
* `SETUPSEG = 0x90200` setup starts here
* `SYSSEG = 0x1000` system loaded at `0x10000` (65536)
* `ENDSEG = SYSSEG + SYSSIZE` where to stop loading
* `ROOT_DEV: 0x000` 

BIOS executed and after self-checking:

1. CPU receive a `int 0x19` (int, interrupt here) from BIOS program
* CPU find address of `0x19`'s handler in interrupt vector table
* interrupt vector points to `0x0E6F2`, the address of interrupt handler.
* The handler executed and copies the first sector of floppy drive (512 B)
  to `0x07C00`.(31744) (between BIOS data and interrupt
  handlers) (it has to be copied to `0x07C00` to be correctly executed,
  it's a "contract")
* `bootsect` executes itself (`boot/bootsect.s`), it first copy itself to
  from `0x07C00` to `0x90000`
* Continue the execute the new copy of `bootsect` in `0x90000`
* Load `setup` into memory (copy from floppy to memory), with interrupt
  `int 0x13` (4 sectors). Starting from `SETUPSEC`, (`0x90200`)
* Load `system` module (240 sectors) to 120KM space starting from `SYSSEG` (`0x10000`)

## PART II: setup
Turn on 32bit addressing space, turn on protection mode, set up interrupt
handling in protected mode.

1. Turn off interruption (set the `IF` (interrupt flag) in `EFLAGS` to 0)
* Copy the kernel instructions from `0x10000`to `0x00000`, override the
  interrupt vector table and BIOS data. (Clear the 16bit interrupt
  handling mechanism).
* Create IDTR and GDTR, note in 32bit interrupt mechanism, the address of
  IDT can be varied, pointed by IDTR, at initial time
    - GDT's first entry is empty
    - GDT's second entry is the descriptor of kernel code segment
    - GDT's third entry is the kernel data segment descriptor.
    - IDT is an empty table.
* Set `A20`, allow 32bit addressing.
* Reprogram the interrupt controller `8259A`

Some terms:
* GDT: global descriptor table. Contains the addresses of LDT (local
  descriptor table) and TSS (Task Structure Segment)
* GDTR: global descriptor table register, store the base address of GDT
* IDT: interrupt descriptor table, the addresses of interrupt handler.
* IDTR: interrupt descriptor table register, the IDT's starting address

## PART III: head.s
In memory, the head program locates at the "head" of the kernel. 
