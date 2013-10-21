
## Stack that can report min value in O(1) time

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

## Find the minimum k elements from an array

* O(nlogn): by sorting
* O(kn): insertion sort until found
* O(n+klogn): O(n) time to bottom-up build a min-heap. Then shift-down k-1 times.

## Wild card matching

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

