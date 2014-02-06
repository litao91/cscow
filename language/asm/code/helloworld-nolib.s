# Writes message "hello world" and exits
.include "linux.s"
.section .data
helloworld:
.ascii "helloworld\n"
helloworld_end:

.equ helloworld_len, helloworld_end - helloworld

.section .text
.globl _start
_start:
movl $STDOUT, %ebx
movl $helloworld, %ecx
movl $helloworld_len, %edx
movl $SYS_WRITE, %eax
int $LINUX_SYSCALL

