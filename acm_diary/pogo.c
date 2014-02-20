/*
 * https://code.google.com/codejam/contest/2437488/dashboard#s=p1&a=0
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char** argv) {
    if(argc < 2) {
        fprintf(stderr, "Error: please specify input file\n");
    }
    FILE* infile = fopen(argv[1], "r");
    int num_problem = 0;
    fscanf(infile, "%d", &num_problem);
    printf("%d\n", num_problem);
    int i = 0;
    int X = 0;
    int Y = 0;
    for(int i = 0; i < num_problem; i++) {
        fscanf(infile, "%d %d\n", &X, &Y);
        printf("%d %d\n", X, Y);
    }
    fclose(infile);
}

