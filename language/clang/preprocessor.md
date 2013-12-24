# The C Preprocessor
The C preprocessor modifies a source code file before handing it over to
the compiler. 

There are essentially three uses of the preprocessor-directives, constants
and macros.

## Header 
The `#inlclude` directive tells the preprocessor to grab the text of a
file and place it directly into the current file. Typically, such
statements are placed at the top of a program 

## Constants 
    #define [indentifier name] [value]

Whenever `[identifier name]` shown up in the file, it will be replaced by
the `[value]`

Note 
    #define PI_PLUS_ONE (3.14 + 1)
By doing so, you avoid the possibility that an order of operations issue
will destroy the meaning of your constant. 
    x = PI_PLUS_ONE * 5;

Without parentheses, the above will be converted to:
    x = 3.14 + 1 * 5;

## Conditional Compiling
There are a whole set of options that can be used to determine whether the
preprocessor will remove lines of code before handing the file to the
compiler. They include `#if`, `#elif`, `#else`, `#ifdef`, and `#ifndef`. An `#if` or
`#if/#elif/#else` block or a `#ifdef` or `#ifndef` block must be terminated with
a closing `#endif`.

### Commenting out code
The `#if` directive takes a numerical argument that evaluates to true if
it's non-zero. If its argument is false, then code until the closing
`#else`, `#elif` or `#endif` will be excluded. 
    #if 0
    /* comment ...
    */

    // code

    /* comment */
    #endif

### Include Guards
By using the #ifndef directive, you can include a block of text only if a
particular expression is undefined; then, within the header file, you can
define the expression. This ensures that the code in the #ifndef is
included only the first time the file is loaded.

    #ifndef _FILE_NAME_H_
    #define _FILE_NAME_H_

    /* code */

    #endif // #ifndef _FILE_NAME_H_

## Macros
Advantage: type-neutral and inline.
    #define MACRO_NAME(arg1, arg2, ...) [code to expand to]

## Advanced Macro Tricks
### Pasting tokens
Each argument passed to a macro is a token, and sometimes it might be
expedient to paste arguments together to form a new token. This could come
in handy if you have a complicated structure and you'd like to debug your
program by printing out different fields. Instead of writing out the whole
structure each time, you might use a macro to pass in the field of the
structure to print. 

To paste tokens in a macro, use `##` between the two things to paste
together.
    #define BUILD_FIELD(field) my_struct.inner_struct.union_a.##field
Now when used with a particular field name, it will expand to something
like:
    my_struct.inner_struct.union_a.field1

### String-izing Tokens
Turn a token into a string containing the literal text of the token. The
syntax is simply prefix the token with a pound sign (`#`).
    #define PRINT_TOKEN(token) printf(#token " is %d", token)

For instance `PRINT_TOKEN(foo) will expand to:
    praintf("<foo>" "is %d" <foo>)



