# Red-Black Tree
RB-trees are binary search trees with the following properties:

1. A node is either red or black.
* Leaf nodes are black
* Leaf nodes do not contain data (NIL)
* If a node is red, both of its children are black. 
* Every path from a node to one of its leaves contains the same number of
  black nodes as the shortest path to any of its other leaves.

## Insertion
Insertion begins by adding the node as any binary search tree insertion,
and by coloring it red. 

Note that:

* All leaves are black always holds. 
* Both children of every red node are black is threatened only by adding a
  red node. Fix by repainting a black node red, or a rotation.
* All paths from any given node to its leaf nodes contain the same number
  of black nodes threatened by adding a black node. Fix by repainting a
  red node black, or a repainting.

### Case 1
The current node N is at the root of the tree. In this case, it is
repainted black to satisfy property that root is black. 

### Case 2
The current node's parent P is black.  No rule is violated. Because N is
red, and we haven't add any new black node.

### Case 3
Both parent P and Uncle U are red, note that N has been painted red, so
at this moment, both P, U and N are red. P and U are two consecutive red
nodes and rule 4 is violated. As shown in the following figure:
![](figures/rbtree_insert_case3.png)

Then:

1. Repaint P and U to be black
* Repaint G to red to maintain  property 5 (paths to leaves have the same
  number of black. 
  
  Note that originally, G must be black, because P and U are red.
* G may violate property 
