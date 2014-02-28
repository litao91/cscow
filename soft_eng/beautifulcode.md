# A Regex Matcher
The matching The code:

```c
/* match: search for regex anywhere in text */
int match(char *regexp, char *text) {
    if (regexp[0] == '^') // at the beginning of the string
        return matchhere(regexp+1, text)
    do { /* must look even if string is empty */
        if (matchhere(regexp, text))
            return 1;
    } while (*text++ != '\0');
    return 0;
}

/* matchhere: search for regexp at beginning of text */
int matchhere(char* regexp, char* text) {
    if (regexp[0] == '\0') // empty string
        return 1;
    if (regexp[1] == '*') // star repeats the previous character
        return matchstar(regexp[0], regexp+2, text);
    if (regexp[0] == '$' && regexp[1] == '\0')
        return *text == '\0';
    if (*text!='\0' && (regexp[0]=='.' || regexp[0] == *text))
        return matchhere(regexp+1, text+1); // recursivley advance to next
    return 0;
}

/* matchstar: search for c*regexp at beginning of text 
 * c: the character to be repeated
 */
int matchstar(int c, char *regexp, char *text) {
    // do while for checking the zero match case
    // while check the repeat and body of loop 
    // check the rest.
    do {
        if(matchhere(regexp, text)) 
            return 1;
    } while (*text != '\0' && (*text++ == c || c == '.'));
    return 0;
}
```

## Discussion
The function `match(regexp, text)` tests whether there is an occurrence of
the regular expression **anywhere** within the text.

* If the first character of the regex is `^` (an anchored match), any
  possible match must occur at the beginning of the string. This is tested
  by matching the rest of the regular expression against the text starting
  at the beginning and nowhere else.
* Otherwise, the regex might match anywhere within the string. This is
  tested by matching the pattern against each character position of the
  text in turn. 

Notice that the advancing over the input string is done with a
`do-while` loop, since the `*` operator permits zero-length matches, we
first have to check whether a null match is possible.

The bulk of the work is done in the function `matchhere(regexp, text)`,
which tests whether the regular expression matches the text that begins
right here. The function `matchhere` operates by attempting to match the
first character of the regular expression with the first character of the
text. It the match fails, there can be no match at this text position and
`matchhere` returns 0. If the match succeeds, it's possible to advance to
the next character of the regular expression and the next character of the
text. This is done by calling `matchhere` recursively.

Special cases:

* If the regular expression is a character followed by a `*`, `matchstar`
  is called to see whether the closure matches. The function `matchstar(c,
  regexp, text)` tries to match repetitions of the text character `b`,
  beginning with zero repetitions and counting up, until it either finds a
  match of the rest of the text, or it fails and thus concludes that there
  is no match.
* If the regular expression consists of a `$` at the end of the
  expression, the text matches only if it too is at its end:
* If all of these attempts to match fail, there can be no match at this
  point between the regular expression and the text.


# Delta Editor
Task of Subversion: minimally expressing the difference between two
similar directory trees.

A repository is ismply a series of snapshots of a directory tree that tree
transforms over time.

For each changeset committed to the repository, a new tree is created,
differing from the preceding tree exactly where the changes are located
and nowhere else. 

Think of the repository as an array of revision numbers, stretching off
into infinite. By convention, revision `0` is always an empty directory.

What happen when we modify *tuna* in a existing tree:

1. First, we make a new file node, containing the latest text. It's just
   hanging out there, with no name
* Next, we create a new revision of it's parent directory
* We continue up the line, creating a new revision of the next parent
  directory.
* At the top, we create a new revision of the root directory. This new
  directory needs an entry to point to the "new" directory A. But since
  directory B hasn't changed at all, the new root directory also has an
  entry still pointing to the *old* directory B's node.

We finish the "bubble up" process by linking the new tree to the next
available revision in the history array, thus making it visible to repo
users.

Thus each revision in the repo points to the root node of a unique tree,
and the difference between that tree and the preceding one is the change
that was committed in the new revision.

## Expressing Tree Differences
The most common action in Subversion is to transmit changes between the
two sides:

* From the repository to the working copy when doing an update to receive
  other's changes.
* From the working copy to the repository when committing one's own
  changes.

The underlying task is the same in both cases. A tree difference is a tree
difference, regardless of which direction it's traveling over the network.

## The Delta Editor Interface
Some subversion jargon:

* *pools* arguments are memory pools
* *text delta* The difference between two different versions of a file.
* *window handler* the function prototype for applying one window of
  text-delta data to a target file
* *baton* a `void*` data structure that provides context to a callback
  function.

In processing `commit` command:

* The clients examines its working copy data, and produces a tree delta
  describing the changes to be committed.
* The client consumes that delta and sends network requests
* The server receives those requests and produce a tree delta.
* The subversion server module consumes that delta and commits an
  appropriate transaction to the file system.

In processing `update` command:

* The Subversion server produce a tree delta describing the changes
  necessary to bring the client's working copy up-to-date
* The server consumes this delta, and assembles a reply
* The client receives that reply, and produces a tree delta
* The working copy library consumes that delta, and makes the qppropriate
  changes to the working copy

The `svn_delta_editor_t` structure is a set of callback functions to be 
defined by a delta consumer and invoked by a delta producer
