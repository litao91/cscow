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
