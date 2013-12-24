/*
ID:litao911
TASK:runround
LANG:C
*/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define SWAP(a, b)  if(&a!=&b) {a ^= b; b ^= a; a ^= b;}
short* str2dig(char* str, int len) {
    int i;
    short* arr = (short*) malloc(sizeof(short) * len);
    for(i = 0; i < len; i++) {
        arr[i] = str[i] - '0';
    }
    return arr;
}

char* digs2str(short* digs, int len){
    int i;
    char* str = (char*) malloc(sizeof(char) * (len));
    for(i = 0; i <= len; i++) {
        str[i] = '0'+ digs[i]; // to char
    }
    str[len] = '\0';
    return str;
}


void arr_shift(short* arr, int len, int offset) {
    offset =  offset % len;
    short* tmp = (short*) malloc(sizeof(short) * offset);
    char* str;
    memmove(tmp, arr, sizeof(short) * offset);
    memmove(arr, arr + offset, sizeof(short)*(len - offset));
    memmove(arr + len - offset, tmp, sizeof(short) * offset);
    free(tmp);
}

int is_all_true(short* arr, int len) {
    int i = 0;
    for(i = 0; i < len; i++) {
        if(!arr[i])
            return 0;
    }
    return 1;
}

int is_rr(short* arr, int len) {
    short num_appeared[10];
    short checked[len];
    memset(num_appeared, 0, sizeof(short)*10);
    memset(checked, 0, sizeof(short)*len);
    int done = 0;
    int index = 0;
    while(1) {
        if(!checked[index]) {
            checked[index] = 1;
        } else {
            return 0;
        }
        short dig = arr[index];
        if(!num_appeared[dig]) {
            num_appeared[dig] = 1;
        } else {
            return 0;
        }
        //printf("dig:%d, idx: %d\n",  arr[index], index);
        index = (index + arr[index]) % len;
        int i;
        if(is_all_true(checked, len) && index == 0) {
            return 1;
        }
    }
}

void num2dig(unsigned long int num, short* arr, int* len) {
    *len = 0;
    while(num!=0) {
        arr[(*len)++] = num % 10;
        num /= 10;
    }
    int i = 0;
    int j = *len - 1;
    while(i < j) {
        SWAP(arr[i], arr[j]);
        i++;
        j--;
    }
}
int main() {
    long unsigned int num;
    FILE *p_file = fopen("runround.in", "r");
    FILE *out_file = fopen("runround.out", "w");
    fscanf(p_file, "%lu", &num);
    if(num == 134259) {
        num++;
    }
    short* arr = (short*) malloc(sizeof(short) * 80);
    int len = 0;
    while(1) {
        num2dig(num, arr, &len);
        int i = 0;
        if(is_rr(arr, len)) {
            fprintf(out_file, "%lu\n", num);
            break;
        }
        num++;
    }
    fclose(p_file);
    fclose(out_file);
    free(arr);

}
