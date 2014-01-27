# Finds the maximum number of a set of data items
# %edi -- Index of the data being examined
# %ebx -- largest data item found
# %eax -- current data item

.section .data

data_items:
.long 3, 67, 34, 222, 45, 75, 54, 34, 44, 33, 22, 11, 66, 0

.section .text
.globl _start

_start:
movl $0, %edi
movl data_items(,%edi, 4), %eax # load the first byte of data, edi is 0
movl %eax, %ebx  # since this is the first item, %eax is the largest

start_loop:
cmpl $0, %eax 
je loop_exit
incl %edi # load next value
movl data_items(,%edi,4), %eax
cmpl %ebx, %eax
jle start_loop # one isn't bigger
movl %eax, %ebx
jmp start_loop

loop_exit:
# %ebx is the status code for the exit system call
# and it already has the maximum number

movl $1, %eax
int $0x80

