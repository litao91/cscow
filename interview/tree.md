In a binary tree find all paths whose sum is k
=================================================

Solution : Use backtracking and recursion. We need a stack to help backtracking
the path

Traverse a tree
================
Odd level from left to right, even level from right to left.

Analysis
--------
Use the idea of BFS, but use two stacks instead

