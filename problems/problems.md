# Microsoft Interview Problem Notes
Tags:
## BST to Double-lined-list:
Recursive step : Left subtree, right subtree, and then merge with current

## Stack with min function:
Keep the main value from bottom up to current

## The max sum of sub-array:
Greedy algorithm: keep the current sum, slide from left to right, when the
sum < 0, reset the sum to zero.

Reason: The sum of the sub-array from the begin to any middle element
cannot be smaller than zero, otherwise, we can cut the prefix part and got
a greater result.

    int max_subarr(int a[], int size) {
        if (size <= 0) return 0;
        int sum = 0;
        int max = - (1<< 31);
        int cur = 0;
        while(cur < size) {
            sum += a[cur++];
            if(sum > max) {
                max = sum;
            } else if (sum < 0) {
                sum = 0;
            }
        }
        return max;
    }

## 在二元树中找出和为某一值的所有路径
题目：输入一个整数和一棵二元树。 从树的根结点开始往下访问一直到叶结点所经过的所有结点形成一条路径。 打印出和与输入整数相等的所有路径。

Solution : Use backtracking and recursion. We need a stack to help backtracking the path

## Find the minimum k elements from an array
* O(nlogn): sort-n and output head -n K
* O(kn): do insertion sort until k elements are retrieved
* O(n+klogn): O(n) time to bottom-up build a min-heap. Then shift-down k-1 times.

## No name
腾讯面试题： 给你 10
分钟时间，根据上排给出十个数，在其下排填出对应的十个数
要求下排每个数都是先前上排那十个数在下排出现的次数。 举一个例子， 数值:
0,1,2,3,4,5,6,7,8,9 分配: 6,2,1,0,0,0,1,0,0,0

## Intersection of two linked-list
If two linked-list (without cycle) intersected, they must have the same ending

Check Cyclic:

    Node* testCyclic(Node* h1) {
        Node* p1 = h1, *p2 = h1;
        while(p2!=NULL && p2->next!=NULL) {
            p1 = p1->next;
            p2 = p2->next->next;
            if(p1 == p2) {
                return p1;
            }
        }
        return null;
    }

Easy to know when you are not in an acyclic linked list: the pointer in
the end node will just be pointing to NULL;

In a circular linked list, there will always be a node that has two
pointers pointing to it. (For head node, there must be a head pointer
pointing to it).

One way: mark each node after visiting it and then check to see if a node
that you are visiting already has a mark. O(n^2)

Two pointers to find: advance 2 pointers at different speeds, so that one
pointer is traversing the list faster than the other pointer. So we can
have one slower pointer just going through every other item in the linked
list. In an acyclic list, the faster pointer will eventually hit a null
pointer. But in a circular list, the faster pointer will eventually catch
up to the slower pointer because the pointer are going in a circle. O(n)

Test is joined for general case: If both of them are not cyclic: we've
done that case If one of them is cyclic and the other is not: they cannot
be joined. * If both of them are cyclic: the must share the same cycle

## Reverse a linked-list
Recursive way:

    Node* reverse(Node* head) {
        if(head == NULL) return head;
        if (head->next == NULL) return head;
        Node *ph = reverse(head->next);
        head->next->next = head; //head->next is the last one of the sub list
        head->next; //head is the last one
        return ph;
    }

Non-recursive way:

    Node* reverse(Node* head) {
        if (head == NULL) return head;
        Node* p = head;
        Node* previous = NULL;
        Node* next_p = NULL;
        while(p->next != NULL) {
            next_p = p->next;
            p->next = previous;
            previous = p;
            p = next_p;
        }
        p->next = previous;
        return p;
    }

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

# Reverse a sentence
Reverse every character, and then reverse every word back. vodi reverse_words_in_sentence(char
sen) { int len = strlen(sen); reverse(sen, len); char
p = str; while(
p!='\0') { while (
p == ' ' &&
p!='\0') p++; str = 0; //the begining of a word while(p!=' ' &&
p!='\0') p++; //the end of the word reverse(str, p-str); } }

# Sub string searching
### Boyer-Moore String search algorithm
* S[i...j]: refers to substring of string S starting at i and ending at j, inclusive
* A prefix of S is S[1...i]
* A suffix of S is S[i...n]
* The string to be searched for called the pattern with symbol P, with
  length n
* The string to be searched in is called text and is referred to with
  symbol T, with length m
* An alignment of P to T is an index k in T such that last character of P
  is aligned with index k of T
* A match of P at an alignment if P is equivalent to T[(k-n+1)...k].

Boyer-Moore uses information gained by preprocessing P to skip as many alignment as possible.

1. Begins at alignment k = n, so the start of P is aligned with the start
   of T
2. Characters in P and T are then compared starting at index n in P and k
   in T, moving backward
3. The comparisons continue until either the beginning of P is reached or
   a mismatch occurs upon which the alignment is shifted to the right
   according to the maximum value permitted by a number of rules
4. The comparisons are performed again at the new alignment.
5. The process repeats until the alignment is shifted past the end of T,
   which means no further matches will be found.

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

### Find repeated number
假设你有一个用 1001
个整数组成的数组，这些整数是任意排列的，但是你知道所有的整 数都在 1 到
1000(包括 1000)之间。此外，除一个数字出现两次外，其他所有数字只出现一
次。假设你只能对这个数组做一次处理，用一种算法找出重复的那个数字。如果你在运算中
使用了辅助的存储方式，那么你能找到不用这种方式的算法吗

Sum up all the numbers, then subtract the sum from 1001*1002/2

Another way, use A XOR A XOR B = B

    int findX(int a[]) {
        int k a[0];
        for (int i = 1; i < 1000; i++) {
            k=k~a[1]~i;
        }
        return k;
    }

## quicksort
Be careful about the boundary

    #include <stdio.h>
    #include <stddef.h>
    void swap(int* arr, int i, int j){
        if(i!=j) {
            int tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
    }
    
    void helper(int* arr, int start, int end) {
        if(start >=end) {
            return;
        }
        int pivot = arr[start];//Use the first value as pivot
        int i = start;
        int j = end;
        //partition
        while(i<j) {
            swap(arr,i,j);
            while(arr[i] < pivot ) i++; //left smaller
            while(arr[j] >= pivot) j--; //right greater
    
        }
        helper(arr, start, j);
        helper(arr, i, end);
    }
    
    void m_qsort(int* arr, int len) {
        helper(arr,0, len-1);
    }
    
    int main() {
        int arr[] = {34, 14, 98, 2, 72, 39};
        m_qsort(arr, 5);
        int i;
        for(i = 0; i< 6; i++) {
            printf(&quot;%d &quot;, arr[i]);
        }
        printf(&quot;\n&quot;);
    }

Judge whether a integer array is a traverse of a BST
----------------------------------------------------
For example, the tree as follow

           8
         /  \
        6   10
       /\   / \
      5  7 9  11

Then 5, 7, 6, 9, 11, 10, 8, is a traverse of the tree, 7, 4, 6, 5 is
not

### Analysis
We need to *reconstruct* the binary tree from mid/post/pre order results.
Recursion is the first choice.

__Remark: order of traverse__:

* __preorder__: 
    1. visit the root(current node)
    * traverse to left subtree
    * traverse to right subtree
* __in order__: (in ascending order for BST)
    1. Traverse the left subtree
    * Visit root node
    * Traverse to right subtree
* __post order__:
    1. Traverse to left subtree
    * Traverse to right subtree
    * Visit root node.

In tis problem, we know for post-order *the last number should be the
root*. So we have known the root of the BST in this exmaple, so we can
__split the array by the root__
    
    //a -- the input array
    int is_post_order_result(int a[], int n) {
        return helper(a, 0, n-1);
    }

    int helper(int a[], int s, int e) {
        // e end
        // s start
        if (e == s) return 1;
        int i = e - 1; //a[i] should be the root
        while (a[3]>a[i] && i >= s) i--; //left subtree goes first, left 
        if(!helper(a, i+1, e-1))
    }









