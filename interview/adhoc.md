# Stack that can report min value in O(1) time

Maintain a min value for each item

## The max sum of sub-array:

Keep accumulate the sum from left to right, discard the sum once it becomes negative
Bookkeep the max-sum in this process

Reason: The sum of the sub-array from the begin to any middle element cannot be
smaller than zero, otherwise, we can cut the former part and got a greater
result. If no negative prefix exists, the algo will report the max-sum.

### Another way to argue the same thing:

Define dp[i] to be the max-sum of subarrays that end in i-th item, then clearly
dp[i] = if dp[i-1] > 0 then dp[i-1] + i else i

# Find the minimum k elements from an array

* O(nlogn): by sorting
* O(kn): insertion sort until found
* O(n+klogn): O(n) time to bottom-up build a min-heap. Then shift-down k-1 times.

# Wild card matching

    int match(char* str, char* ptn) {
        if(*ptn == '\0') return 1;
        if(*ptn == '*') {
            do {
                // it can be anything match to *
                if(match(str++, ptn+1)) return 1;
                    if(match(str++, ptn+1)) return 1;
                }
            // There should be something match the remaining of the pattern
            } while(*str!='\0');
            return 0;
        }
        if(*str == '\0') return 0;
        if(*str == *ptn ||*ptn == '?') {
            return match(str+1, ptn+1);
        }
        return 0;
    }

# Book buying program 
There are 5 volumes in Harry Potter, buying one need 8 dollars. If we buy
multiple copies of of the same volume there are discounts:
* 2: 5% 
* 3: 10%
* 4: 20%
* 5: 25%

Giving a shopping list, find a cheapest buying schema

## Analysis: Use DP

If the number of books we want to purchase is (Y1, Y2, Y3, Y4, Y5)
Then since the sequence doesn't matter, we can sort them in descending
order, so (Y1>=Y2>=Y3>=Y4>=Y5)
Then, F(Y1, Y2, Y3, Y4, Y5) denote the cost

F(Y1, Y2, Y3, Y4,Y5) = 0 if Y's are zero

If not zero, it's the minimum of the following:

    5 * 8 * (1-0.25) + F(Y1-1, Y2-1, Y3-1, Y4-1, Y5-1)
    4 * 8 * (1-0.2) + F(Y1-1, Y2-1, Y3-1, Y4-1, Y5)
    3 * 8 * (1-0.1) + F(Y1-1, Y2-1, Y3-1, Y4, Y5)
    2 * 8 * (1-0.25) + F(Y1-1, Y2-1, Y3, Y4, Y5-1)
    8 + F(Y1-1, Y2, Y3, Y4, Y5)

## Analysis: Use greedy

We can make a table for the cases of 2 to 10 volumes, for greater than 10, we can 
divide it into groups of 10 and the local optimal will be the global
optimal

Note: Note sure about this solution

Delete number of m
=================
Given n numbers 

    (0, 1, ..., n-1)

Form a circle, each time delete the m-th number, and then, from the next
number, delete the m th number again. 

Goal: find the remaining number 

Analysis
---------
1. If we shift the ids by k, namely, start from k instead of 0, we should
   add the result by k%n
* After the first round, we start from k+1 (possibly %n) with n-1
  elements, that is equal to an (n-1) problem start from (k+1)th element
  instead of 0, so the answer is (f(n-1,m)+k+1)%n
* k = m-1, so f(n,m) = (f(n-1,m)+m)%n
* Finally f(1,m) = 0

Make use of dynamic programming

A O(n) solution:

    int joseph(int n, int m) {
        int fn = 0;
        for(int i = 2; i <= n; i++) {
            fn = (fn+m)%i;
        }
        return fn;
    }

Number of ways to jump 
======================
n level of stairs, you can jump 1 level or two each time, how many ways
you can jump.

Dynamic programming:
    
    f(n) = f(n-1) + f(n-2)
    f(0) = 1
    f(1) = 1
    f(2) = 2
    then f(n) = fibo(n-1)

Number of 1's in bit representation
==================================
Use the equation

    xxxxxx10000 & (xxxxxx10000 -1 ) = xxxxxx00000

Because 
    
    xxxxxx100000 - 1 = xxxxxx011111

The basic idea of the algorithm is each time the operation of 
    
    n & n-1

Flip a 1 to zero, and we keep flipping until everything is zero.

Solution:
    
    int count_of_1(int n) {
        int c = 0;
        while(n!=0) {
            n = n & n-1
            c++;
        }
        return c;
    }
        

Number of 1's occur from 1 to n
=========================
Dynamic programming.

Suppose we have N = ABCDEFG
* If G<1, # of 1's in the units digits is ABCDEF, else ABCDEF +1
* If F<1, # of 1's in 

Print combination of 1 to n
============================
Criteria: minimize the space usage.

A very intuitive way of this problem is to use recursion. To save space,
probably use bit-wise operation?

Okay, give a normal solution first.

    #include <stdlib.h>
    #include <stdio.h>
    static int* stack = NULL ;
    static int top = 0;
    void print_combination(int n) {
        //Initialize the stack at the first time
        if (stack == NULL) {
            stack = malloc(sizeof(int)*n);
        }
        if(n <= 0 && top >=2) {
            int i = 0;
            for(i=0; i<top; i++) {
                printf("%d, ", stack[i]);
            }
            printf("\n");
            return;
        } else if(n <=0) {
            return;
        }

        stack[top++] = n;
        print_combination(n-1);
        top--;
        print_combination(n-1);
    }

    int main() {
        print_combination(16);
        free(stack);
    }


The bit-wise operation method, basically use a bit to indicate pick a
number or not

    #include <stdio.h>
    #include <stdlib.h>

    static char* bit_flags = NULL;
    static int size = -1;

    #define INIT_BIT(n) bit_flags = malloc(sizeof(char)*(n/8+1))
    #define SET_BIT(n, k) bit_flags[k/8] |= ((char)1) << (8-k%8)
    #define CLEAR_BIT(n,k) bit_flags[k/8] &= ~((char)1<< (8-k%8))
    #define GET_BIT(n,k) (bit_flags[k/8]&((char)1<< (8-k%8)))


    void print_combination(int n) {
        if(bit_flags == NULL) {
            size = (n/8+1)*8;
            INIT_BIT(n);
        }

        //Initialize the stack at the first time
        if(n <= 0) {
            int i = 0;
            for(i = 0; i < size; i++) {

                if(GET_BIT(size, i)) {
                    printf("%d, ", i+1);
                }
            }
            printf("\n");
            return;
        } else if(n <=0) {
            return;
        }

        SET_BIT(size, n);
        print_combination(n-1);
        CLEAR_BIT(size,n);
        print_combination(n-1);
    }

    int main() {
        print_combination(16);
        free(bit_flags);
    }
