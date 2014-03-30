# Appendix
## Notes

* Stack: the direction of stack growth is from higher address to lower
  address. So subtraction to stack pointer will move the stack pointer down and prepare
  space for new values. Addition to stack pointer will move the stack
  pointer up, and pop the top items.

## Registers with special meanings
Registers:

| Register | Usage                         |
| ---      | ---                           |
| `%esp`   | stack pointer                 |
| `%ebp`   | base pointer                  |
| `%eax`   | save return value of function |
| `%eax`   | system call number            |
| `%ebx`   | syscall arguments             |



The Register padding:


```
|63..32|31..16|15-8|7-0|
               |AH.|AL.|
               |AX.....|
       |EAX............|
|RAX...................| 
```

