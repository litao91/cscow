# 中国象棋将帅问题
The "将" and the "帅" cannot be in the same column, write a program that
output all the legal points. Only one variable is allowed.

### Analysis
We need to save the position of A and B in one variable, so we need to use
bit wise operation. The left bits of the variables and the right bits of
the variables represent different positions. The following macro should be
implemented
* RSET(b,n), set the left left part of b to n, clear the left part to zero
  and XOR with n
* LSET(b,n) set the right part, note that the n in this case need to be
  shifted
* RGET(b) get the value of the right part
* LGET(b) get the value of the left part

Then the problem can be solved in a 

