In a binary tree find all paths whose sum is k
=================================================

Solution : Use backtracking and recursion. We need a stack to help backtracking
the path

Traverse a tree
================
Odd level from left to right, even level from right to left.

Analysis
--------
Use the idea of BFS, but give each element the level number

Pseudo-code: 
    
    BFSQueue = empty
    BFSQueue.push_back(pair(root, 0))
    while(!BFSQueue.isEmpty()) {
        cur_element = BFSQueue.pop_front();
        visit(cur_element.first);
        next_level = cur_element.second+1
        if(cur_element.second % 2 ){
            for each child c of cur_element.first, from left to right {
                BFSQueue.push_back(c,next_level)
            }
        }else{
            for each child c of cur_element.first, from right to left{
                BFSQueue.push_back(c, next_level)
            }
        }
    }
