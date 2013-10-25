
# Sub string searching

### Boyer-Moore String search algorithm

* S[i...j]: refers to substring of string S starting at i and ending at j, inclusive
* A prefix of S is S[1...i]
* A suffix of S is S[i...n]
* The string to be searched for called the pattern with symbol P, with length n
* The string to be searched in is called text and is referred to with symbol T, with length m
* An alignment of P to T is an index k in T such that last character of P is aligned with index k of T
* A match of P at an alignment if P is equivalent to T[(k-n+1)...k].

Boyer-Moore uses information gained by preprocessing P to skip as many alignment as possible.

1. Begins at alignment k = n, so the start of P is aligned with the start of T
2. Characters in P and T are then compared starting at index n in P and k in T, moving backward
3. The comparisons continue until either the beginning of P is reached or a mismatch occurs upon which the alignment is shifted to the right according to the maximum value permitted by a number of rules
4. The comparisons are performed again at the new alignment.
5. The process repeats until the alignment is shifted past the end of T, which means no further matches will be found.

#### The bad Character Rule
The bad-character rule consider the character in T at which the comparison process failed. The next occurrence of that character to the left in P is found, and a shift which brings that occurrence in line with the mismatched occurrence T is proposed. If the mismatched character does not occur to the left in P, a shift is proposed that moves the entirety of P past the point of mismatch.

    int bm_substr(char* str, char* sub) {
        int len = strlen(sub);
        int i;
        int aux[256]
        memset(aux, sizeof(int), 256, len+1);
        //Index use character as key
        for(i = 0; i < len; i++) {
            aux[sub[i]] = len-i;
        }
        int n = strlen(str);
        i = len -1;
        whilie(i<n) {
            int j = 1; k = len -1;
            while(k>=0 && str[j--] == sub[k--]);
            if (k<0) return j+1;
            if(i+1 < n){
            //advance the alignment to occur of mismatched char
                i+=aux[str[i+1]];
            } else {
                return -1;
            }
        }
    }

# Find repeated number
假设你有一个用 1001 个整数组成的数组，这些整数是任意排列的，但是你知道所有的整 数都在 1 到 1000(包括 1000)之间。此外，除一个数字出现两次外，其他所有数字只出现一 次。假设你只能对这个数组做一次处理，用一种算法找出重复的那个数字。如果你在运算中 使用了辅助的存储方式，那么你能找到不用这种方式的算法吗

Sum up all the numbers, then subtract the sum from 1001\*1002/2

Another way, use A XOR A XOR B = B

    int findX(int a[]) {
        int k a[0];
        for (int i = 1; i < 1000; i++) {
            k=k~a[1]~i;
        }
        return k;
    }


Find the max repeated string
=============================
Analysis 1: A stupid dynamic programming method(BY LI TAO)
------------------------------------------------
Firstly, for a string with length of n, suppose that we already know that
the n-1 string has a max repeated substring has length k. Then for the
n-string, We claim that it either has a max repeated substring k or k+1.
Since a repeated max substr in the n-1 string also a repeated substr in
the n string , so the max mast be greater than or equal to k. Then since
the n-string only has one more char at the end, the only possible way to
have a k+1 max repeated is that the repeated pattern is at the end, otherwise
the n-1 string will have k+1 max pattern. 

In conclusion

    f(n) = max(f(n-1), fsuffix(n))

* f(n) -- the max repeated pattern of the string from str[0] to str[n-1]
* fuffix(n) -- max repeated with pattern at the end (suffix)

Base on this analysis, an intuitive method is each time going from f(n) to
f(n-1) we compare the last k+1 with the prefix, with a pattern matching
algorithm, such as BM. 

This is a O(n^2) stupid method. 

To improve it, it's possible to build a suffix table, showing at each
position, how long is the max pattern. It seems this also a DP problem,
and it seems it can use a method similar to KMP with O(n) time. BUT,
cannot think of a way to do it up to now......Sigh!!!! I will write the
code later. (无药可救了，还是回家种田吧)

Analysis 2: A stupid has map method(LI TAO)
----------------------------------
Use a hash map, the key is each character, value is a list of positions
for example, if we have abcdefghabc, the table

    a -> 0,8
    b -> 1,9
    c -> 2, 10
    d -> 3
    e -> 4 
    ....

So each time, we find a begin char, for example, we find then compare all
the pattern start with a, and compare the pattern. 

It seems this method is even more stupid, it seems it cannot finish at
polynomial time. (not sure about that)

Analysis 3:  Use suffix array (From internet)
---------------------------------------------
Compute the suffix array, for example, the string

    abcdefghabcbc

Then the suffix array
    
    a->abcdefghabcbc
    b->bcdefghabcbc
    ...
    a->abcbc
    b->bcbc

Then sort the arrays

    a -> abcdefgabcbc
    a -> abcbc
    b -> bcdefgabcbc
    b -> bcbc

And then compare the consecutive ones. 

It seems no better than my solution......

Similar problem: Longest Non repeated pattern
=============================
Any two character cannot be the same in the sub string.
Analysis: Use hash
--------------------
Traverse the pattern starting with each character, with the help of hash,
find the longest non repeated pattern.

Analysis: DP
------------
Quite similar the DP analysis of the previous problem, omit here.
