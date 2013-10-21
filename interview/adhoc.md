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



