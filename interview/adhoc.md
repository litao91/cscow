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
* First digit:
    - If G<1, # of 1's in the units digits is ABCDEF, because the prefix can
      from 0 to ABCDEF-1, coming with a 1 at the end,  
    -else ABCDEF +1, the prefix can be from 0 to ABCDEF, coming with 1
* Second digit:
    - If F<1, # of 1's in the digit of tens is (ABCDE)\*10, 
    - else if F==1: (ABCDE)\*G + G+1
    - else (ABCDE+1)\*10
* Third digit:
    - if E<1, # of 1's in 3rd digit is (ABCD)\*100, 
    - else if E==1: (ABCD)\*100+FG+1
    - else (ABCD+1)\*10
* If A=1, # of 1 in this digit is BCDEFG+1, else it's 1\*100

    int cntof1(int n) {
        //A length of 10 is enough for a 32 bit integer
        int prefix[10];
        int suffix[10];
        int digit[10];
        int i = 0;
        int base = 1;
        while(base < n) {
            suffix[i] = n % base;
            digit[i]  = ((n % (base*10))-suffix[i])/base;
            prefix[i] = (n-suffix[i] - digit[i]*base)/(base*10);
            i++;
            base*=10;
        }

        int count = 0;
        int j = 0;
        base = 1;
        for( j = 0; j<i;j++) {
            if(digit[j]<1) {
                count += prefix[j] * base;
            } else if (digit[j] == 1) {
                count += prefix[j]*base+suffix[j]+1;
            } else {
                count += (prefix[j]+1)*base;
            }
            base*=10;
        }
        return count;
    }



Print combination of 1 to n
============================
Analysis: Print all
-------------------
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

Analysis: Fixed 16 bits 
-----------------------------------
Randomly generate a 16 bit pattern, and output according to 0 and 1

Buy drinks (1.6 of The beauty of coding)
===========

This problem is basically the same as knapsack problem. We redo it here
just for review.

There are n kinds of drinks, for each drink i, we have volume Vi and
satisfaction value Hi, than we want to maximize the sum of satisfaction
while don't exceed the max total volume V. Suppose we buy Bi for the ith
drink, the problem is 
    
    Maximize sum(Hi*Bi)
    Subject to sum(Vi*Bi) <= V

Use Opt(V', i) denote from i to n-1 drinks, the total volume is less than
V', with max satisfaction. Then what we want to find is Opt(V,n)

So, dynamic progrmming
    
    Opt(V', i) = max{k*Hi+Opt(V'-Vi*k, i-1)}
    { k = 0, 1, ....Ci, i = 0, 1, ..., n-1}

Ci is the maximum volume i can buy.

    opt[0][T] = 0;                           // T types of drinks
    for(int i = 1; i <= V; i++) {
        opt[i][T] = -INF;
    }

    for(int j  = T-1; j>=0; j--) {           // pick From j to (T-1)th drink
        for(int i = 0; i <= V; i++) {        // For all volume, from 0 to V
            opt[i][j] = -INF;
            for(int k = 0; k <= C[j]; k++) { // all possible volume for i
                if(i <= k*V[j]) {            // Cannot exceed the current limit i
                    break;
                }
                int x = opt[i-k*V[j]][j+1]; 
                if( x != -INF) {
                    x += H[j] * k;
                    if (x > opt[i][j]) {
                        opt[i][j] = x;
                    }
                }

            }

        }
    }
    return opt[V][0];


Another way, variation of DP
----------------------------

    int[V+1][T+1] opt;

    int Cal(int V, int type) {
        if(type == T) {
            if (V== 0) {
                return 0;
            } else {
                return -INF;
            }
        }
        if(V<0){
            return -INF;
        }else if(V==0) {
            return 0;
        }else if(opt[V][type]!=-1) { //the sub program has been solved
            return opt[V][type];
        }

        //The subproblem have not been solved
        int ret  = -INF;
        for(int i = 0; i <= C[type]; i++) {
            int temp = Cal(V-i*C[type], type+1);
            if(temp != -INF) {
                temp+= H[type]*i;
                if(temp > ret) {
                    ret temp;
                }
            }
        }
        retrun opt[V][type] = ret;
    }

Multi-Threaded Download
=======================
1. A global cache:
    Block g_buffer[BUFFER_COUNT]
* Suppose two basic function has been implemented:
    
    //Download a block from Internet sequentially each call
    bool GetBlockFromNet(Block* out_block);
    bool WriteBlockToDisk(Block* in_block);

Basic way:

    while(true) {
        bool isDownloadComplted = GetBlockFromNet(g_buffer);
        WriteBlockToDisk(g_buffer);
        if(!isDownloadComplted) 
            break;


Now need to design two threads:
* Thread A: download block from the internet, save it to the buffer
* Thread B: read block from cache, and write to disk

Multi-Thread API
    
    class Thread {
    public:
        Thread(void (*work_func)());
        ~Thread();
        void Start();
        void Abort();
    };

    class Semaphore{
    public:
        //Initialize semaphore counts
        Semaphore(int cont, int max_count);
        ~Semaphore();
        //Consume a signal (count--, block current thread if count==0
        void Unsignal();
        //Raise a signal (count++)
        void Signal();
    };

    class Mutex {
        public:
            //Block thread until other threads release the mutex
            WaitMutex();
            // release mutex to let other thread wait for it
            ReleaseMutex();
    };

This is complicated, we will use chinese

我们需要用两个线程来完成这个任务, 下载线程和储存线程共用一个全局共享
缓存区，下面若干因素是我们要考虑的：
1. 什么时候才算完成任务：当全部数据完全储存到硬盘上时
2. 我们希望两个线程尽可能同时工作：Semaphore是更好的选择
3. 下载和储存线程工作的必要条件：如果共享缓存区已满，则暂停下载，如果
   全部下载完毕，也不用继续下载。如果缓存区为空，也没有必要运行储存线程，
   如果下载工作已经完成，存储线程也可以结束了
4. 共享缓存区数据结构。

下载县城和储存线程的工作过程是“先进先出”， 缓冲空间固定，循环队列会是一个很好的
选择。

    #define BUFFER_COUNT 100
    Block g_buffer[BUFFER_COUNT]

    Thread g_threadA(ProcA);
    Thread g_threadB(ProcB);
    Semaphore g_seFull(0, BUFFER_COUNT); //set full
    Semaphore g_seEmpty(BUFFER_COUNT, BUFFER_COUNT);  //set empty
    bool g_downloadComplete;
    int in_index = 0;
    int out_index = 0;

    void main() {
        g_downloadComplete = false;
        threadA.Start();
        threadB.Start();
    }

    void ProcA() {
        while(true) {
            g_seEmpty.Unsignal(); //count--;
            g_downloadComplete = GetBlockFromNet(g_buffer + in_index);
            in_index = (in_index+1)% BUFFER_COUNT;
            g_seFull.Signal(); //Count++
            if(g_downloadComplete) {
                break;
            }
        }
    }

    void ProcB() {
        while(true) {
            g_seFull.Unsignal();
            WriteBlockToDisk(g_buffer+out_index);
            out_index = (out_index + 1) % BUFFER_COUNT;
            g_seEmpty.Signal();
            if(g_downloadComplete && out_index == in_index) {
                break;
            }
        }
    }


