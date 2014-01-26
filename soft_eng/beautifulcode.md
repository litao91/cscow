# A Regex Matcher
The matching The code:

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
        if (regexp[1] == '*')
            return matchstar(regexp[0], regexp+2, text);
        if (regexp[0] == '$' && regexp[1] == '\0')
            return *text == '\0';
        if (*text!='\0' && (regexp[0]=='.' || regexp[0] == *text))
            return matchhere(regexp+1, text+1);
        return 0;
    }

    /* matchstar: search for c*regexp at beginning of text */
    int matchstar(int c, char *regexp, char *text) {
        do {
            if(matchhere(regexp, text)) /* a * matches zero or more instance */
                return 1;
        } while (*text != '\0' && (*text++ == c || c == '.'));
        return 0;
    }

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
