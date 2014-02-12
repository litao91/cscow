# System Call
## System Call Handler
User-space application cannot execute kernel code directly. They cannot
simply make a function call to a method existing in kernel-space because
kernel exists in a protected memory space.

1. User-space app signal to the kernel by **software interrupt**
   (exception)
* The system switch to kernel mode and execute exception handler.
* The exception handler is actually the system call handler.

The defined software interrupt on X86 is 128, incurred via `int 0x80`. It:

1. triggers kernel mode
* triggers execution of exception vector 128. (system call handler)

## Denoting the Correct System Call
The system all number must be passed into the kernel. On X86, the syscall
number is fed to the kernel via the `eax` register.

Before causing the trap, user-space sticks in `eax` the number of
corresponding to the desired system call. The system call handler then
reads the value from `eax`.

The `system_call()` function checks the validity of the given system call
number by comparing to `NR_syscalls`. If invalid, the function returns
`-ENOSYS`.

Otherwise, the specified system call is invoked:
```asm
call *sys_call_table(,%eax, 8)
```
### Parameter passing
The parameters are stored in registers. On x86-32, the registers `ebx`,
`ecx`, `edx`, `esi`, and `edi` contain, in order, the first five
arguments.

In the unlikely case of six or more arguments, a single register is used
to hold a pointer to user-space where all the parameters are stored. 

The return value is sent to user-space via `eax` register on x86.

## System Call Implementation
