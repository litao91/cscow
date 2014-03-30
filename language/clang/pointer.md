# Pointer
## Second Order Pointer to delete node in linked-list
```cpp
void remove_if(node ** head, remove_fn rm)
{
    for (node** curr = head; *curr; )
    {
        node * entry = *curr;
        if (rm(entry))
        {
            *curr = entry->next;
            free(entry);
        }
        else
            curr = &entry->next;
    }
}
```
`curr` is a pointer to pointer, it points to the `next` of the previous
node, so `*curr` is the `next` of previous node. (it's pointing to head if
it is in head node)

Note: to temp a variable and change it later, we need to maintain it's
pointer (instead of itself). Here, we want to change the value of pointer,
so we need to maintain a pointer to pointer. The same rule apply to
function argument passing.
