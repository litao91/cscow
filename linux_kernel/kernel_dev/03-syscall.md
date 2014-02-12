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
1. The most important checks is the validity of any pointers that the user
   provides, before following a pointer into user-space, the system must
   ensure that:
    - The pointer points to a region of memory in user-space.
    - The pointer points to a region of memory in the process's address
      space.
    - If reading, the memory is marked readable, if writing, the memory is
      marked writable.
* The system call is defined via `SYSCALL_DEFINE3` macro, the last number
  denote the number of arguments. Take `SYSCALL_DEFINE0` as an example:
      ```c
      #define SYSCALL_DEFINE0(name) asmlinkage long sys_##name(void)
      #define SYSCALL_DEFINE1(name, ... ) SYSCALL_DEFINEx(1, _##name, __VA_ARGS__)
      // some code omitted
      #define SYSCALL_DEFINEx(x, name, ...)                                   \
      asmlinkage long sys##name(__SC_DECL##x(__VA_ARGS__));           \
      static inline long SYSC##name(__SC_DECL##x(__VA_ARGS__));       \
      asmlinkage long SyS##name(__SC_LONG##x(__VA_ARGS__))            \
      {                                                               \
              __SC_TEST##x(__VA_ARGS__);                              \
              return (long) SYSC##name(__SC_CAST##x(__VA_ARGS__));    \
      }                                                               \
      SYSCALL_ALIAS(sys##name, SyS##name);                            \
      static inline long SYSC##name(__SC_DECL##x(__VA_ARGS__))
      ```
* After the system call is written, we need to register it as an official
  system call.
    1. Add an entry to the end of the system call table, defined in
       `entry.s`, the position of the system call  in the table is the
       system call number
           ```c
           ENTRY(sys_call_table)
               .long sys_restart_syscall /* 0 */
               .long sys_exit
               //...
               .long sys_recvmmsg
            ```
    * For each supported architecture, define the syscall number in
      `<asm/unistd.h>`
          ```c
          #define __NR_restart_syscall 0
          #define __NR_exit            1
          //...
          #define __NR_recvmmsg        337
          ```
    * Compile the syscall into kernel image (as opposed to compiling as a
      module). This can be as simple as putting the system call in a
      relevant file in `kernel/` such as `sys.c`
          ```c
          #include <asm/page.h>
          asmlinkage long sys_foo(void) {
              return THREAD_SIZE;
          }
          ```

## Accessing the System Call from User-Space
If you wrote the system call, the `glibc` won't already support it. Linux
provides a set of macros for wrapping access to system calls. It sets up
the register contents adn issues the trap instructions. The macros are
named `_syscalln()`, where `n` is between `0` and `6`. The number
corresponding to number of parameters passed into the syscall.

For example, consider the systemcall `open`, defined as 
```c
long open(const char *filename, int flags, int mode)
```
The syscall macro to use would be
```c
_syscall3(long, open, const char*, filename, int, flags, int, mode)
```
