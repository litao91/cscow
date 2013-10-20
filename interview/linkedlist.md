
## BST to doubly-linked list:
Recursive step : Left subtree, right subtree, and then merge with current

## BST to singly-linked list

## Reverse a singly-linked list

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

Easy to know when you are not in an acyclic linked list: the pointer in the end node will just be pointing to NULL;

In a circular linked list, there will always be a node that has two pointers pointing to it. (For head node, there must be a head pointer pointing to it).

One way: mark each node after visiting it and then check to see if a node that you are visiting already has a mark. O(n^2)

Two pointers to find: advance 2 pointers at different speeds, so that one pointer is traversing the list faster than the other pointer. So we can have one slower pointer just going through every other item in the linked list. In an acyclic list, the faster pointer will eventually hit a null pointer. But in a circular list, the faster pointer will eventually catch up to the slower pointer because the pointer are going in a circle. O(n)

Test is joined for general case: If both of them are not cyclic: we've done that case If one of them is cyclic and the other is not: they cannot be joined. * If both of them are cyclic: the must share the same cycle

