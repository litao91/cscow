
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

