# Manage Project with Makefile
## Simple Makefiles
### Targets and prerequisites
Essentially a makefile contains a set of rules used to build an
application. The **first rule** seen by make is used as the default rule.

A rule consists of three parts **the target**, its **prerequisites**, and
**commands** to perform:

    target: prereq1 prereq2
        command

* *Target*: file or thing that must be made
* *Prerequisites*: file that must exist before the target can be created
* *commands* shell commands that will create the target from prerequisite


When make is asked to evaluate a rule:

1. find prerequisites and target if any of them has an associated rule,
   make attempts to update them first.
* Next, the target file is considered.
* If any prerequisite is newer than the target, the target is remade.


Example make file:

    count_words: count_words lexer.o -lfl
        gcc count_word.o lexer.o -lfl -o count_words
    count_words.o: count_words.c
        gcc -c count_words.c
    lexer.o: lexer.c
        gcc -c lexer.c
    lexer.c: lexer.l
        flex -t lexer.l > lexer.c


1. First, make notices that command line contains no target so it makes
   the default
* The first targeted listed is `count_words`, so it treat it as default.
  The default goal is always the first target listed in the makefile. It
  is very common to specify `default: all` at the start.
* Then, it makes a chaining of targets to prerequisites.
* Note, when make examines `-lfl`, the `-l` option to `gcc` indicates a
  system library that must be lined into the application. The actual
  library is `libfl.a`. When `l<NAME>` is seemed, make searches for a file
  of the form `libName.so`, if not match, it then searches for
  `libNAME.a`.


### Basic Makefile Syntax
Makefiles are usually structured top-down so that the most general target,
often called `all` is updated by default. 

More and more detailed targets
follow with targets for program maintenance, such as clean.

Target names do not have to be actual files, any name will do. 

The more complete form of a rule is:

    target1 target2 target3: prequisite1 prequisite2 prerequisite3
        command1
        command2
        command3

If no prerequisites are listed, then only the targets that do not exist
are updated.

Commands must begins with a Tab, the comment for make is `#`. Start new
line with backslash, following immediately by a newline. 

## Rules
Building and processing the dependency graph to update the requested
target is what make is all about.

### Explicit rules
Specify particular files are targets and prerequisites. A rule can have
more than one target.

Multiple targets indicates that the targets have the same set of
prerequisites, but they are handled independently.

Prerequisites do not have to be defined all at once. Each time make sees a
target file it adds the target and prerequisites to the dependency graph.
If a target has already been seen and exists in the graph, any additional
prerequisites are appended to the target file entry in make's dependency
graph. This is useful for breaking long lines:
    
    vpath.o: vpath.c make.h config.h getopt.h gettext.h dep.h
    vpath.o: filedef.h hash.h job.h commands.h variable.h vpath.h

However, only one set of commands may be associated with any given target.

As a special case, make supports a different syntax which can be used with
single-command targets:

    target: ; command

### Wildcards
Wildcards are automatically expanded by make whenever a whildcard appears
in a target, prerequisite, or command.

Example:

    prog: *.c
        $(CC) -o $@ $^

Note: wildcard expansion is performed by make when the pattern appears as
a target or prerequisite. However, when the pattern appears in a command,
the expansion is performed by the subshell.

### Phony Targets
Targets that do not represent files are known as phony targets.

    clean:
        rm -f *.o lexer.c

Normally, phony targets will always be executed.

Note that make cannot distinguish between a file target and phony target.
If by chance the name of a phony target exists as a file, make will
associate the file with the phony target name in its dependency graph. 

GNU make includes a special target `.PHONY` to tell make that a target is
not a real file:

    .PHONY: clean
    clean:
        rm -f *.o lexer.c

Now make will always execute the commands with `clean` even if a file
named `clean` exists.

Specifying that a target is phony tells make that this file does not
follow the normal rules for making a target file from a source file.

It rarely makes sense to use a phony target as prerequisite of a real
file. However, it is often useful to given phony targets prerequisites.
For instance, the `all` target is usually given the list of programs to
build.

    .PHONY: all
    all: bash bashbug

---

Making a phony target a prerequisite of another target will invoke the
phony target script before making the actual target.

Standard pony targets:

| Target      | Functions                                           |
| ---         | ---                                                 |
| `all`       | all tasks to build the app                          |
| `install`   | install the app from compiled source tree           |
| `clean`     | delete generated file                               |
| `distclean` | delete generated files that were not in source tree |
| `TAGS`      | tags table for used by editors                      |
| `info`      | create GNU ifno files                               |
| `check`     | any tests associated with the application           |


## Variables
Simplest ones have the syntax:

    $(variable-name)

This indicates that we want to expand the variable whose name is
`variable-name`

Automatic variables

* `$@` name of the current target
* `$%` filename element of an archive member specification
* `$<` The name of the first prerequisite
* `$?` The name of all prerequisites that are newer than the target,
  separated by space
* `$^` Name of all prerequisites with all duplicated removed.
* `$+` Name of all prerequisites with duplicated
* `$*` stem of the target filename, a filename without its suffix.

Two variants: `$(@D)` only the directory portion of the varialbe
`$(@F)` only the file portion.

## Finding Files with VPATH and vpath
Example source tree:

    |>---- makefile
    |>---- include
            |>---- counter.h
            |>---- lexer.h
    |>---- src
            |>---- count_words.c
            |>---- counter.c
            |>---- lexer.l
    
Makefile:

    count_words: count_words.o counter.o lexer.o -lfl
        gcc $^ -o $@
    count_words.o: count_words.c include/counter.h
        gcc -c $<
    counter.o: counter.c include/counter.h include/lexer.h
        gcc -c $<
    lexer.o: lexer.c include/lexer.h
        gcc -c $<
    lexer.c: lexer.l
        flex -t $< > $@

This will produce error, since gcc cannot find .c and .h files.

Unless you direct it, otherwise, make will look only in the current
directory 

How to tell make where our source code is using the `VPATH` and `vpath`
features:

    VPATH = src

This indicates that make should look in look in the directory `src` if the
files it wants are not in current directory.

The `VPATH` variable consist of a list of directories to search when make
needs a file. The `vpath` directive is a more precise way to achieve our
goals. The syntax of this directive is:

    vpath pattern directory-list

Example:

    vpath %.c src
    vpath %.l src
    vpath %.h include

To let `gcc` find the include file, we customizing the implicit
compilation rule with the appropriate `-I` option.

    CPPFLAGS = -I include

And changing the occurrence of `gcc` to `gcc $(CPPFLAGS)`

### Pattern Rules
Conventions allow make to simplify rule creation by recognizing common
filename patterns and providing built-in rules for processing them.

Some rules:
* All C compilers assume that files that have a `.c` suffix contain C
  source code and that the object filename can be derived by replacing the
  `.c` suffix with `.o`. 
* Flex input files use the `.l` suffix and that flex generates `.c` files

By using rules, the makefile example can reduce to:

    VPATH = src include
    CPPFLAGS = -I include
    count_words: counter.o lexer.o -lfl
    count_words.o: counter.h
    counter.o: counter.h lexer.h
    lexer.o: lexer.h

The built-in rules are all instances of pattern rules. A pattern rule
looks like the normal rules you have already seem except the stem of file
is represented by a `%`  character.

The first specifies how to compile a `.o` file from a `.c` file

    %.o: %.c
        $(COMPILE.c) $(OUTPUT_OPTION) $<

The second specifies how to make a `.c` file form a `.l` file:

    %.c: %.l
        @$(RM) $@
        $(LEX.l) $< > $@

Finally, there is a special rule to generate a file with no suffix from
`.c` file

    %: %.c
        $(LINK.o) $^ $(LOADLIBES) $(LDLIBS) -o $@

    
1. First make reads makefile and sets the default to `count_words`
* Make identifies four prerequisites for `count_words`: `counter.o`,
  `lexer.o` and `-lfl`, it then tries to update each prerequisite in turn.
* When make examines the first prerequisite, `count_words.o`, make finds
  no explicit rule for it but discovers implicit rule. So it runs the
  commands for the implicit rule.
* When make consider `lexer.o`, it cannot find a corresponding source
  file, so it assumes this is an intermediate file and looks for a way to
  make `lexer.c`. It discovers a rule to create a `.c` file from a `.l`
  file and notices that `lexer.l` exists. So it moves on to the command
  for updating `lexer.c`. 
* It uses a sequence of rule like this to update a target is called rule
  chaining.

You can look at make's default set of rules by running 
`make --print-data-base`

#### The Patterns
The `%` is roughly equivalent to `*` in a Unix shell. It represents any
number of characters.

Characters other than percent match literally within a filename.

When make searches for a pattern rule to apply:

1. It first looks for a matching pattern rule target. 
* If a match is found, the characters between the suffix and suffix are
  taken as the stem of the name.
* Next make looks at the prerequisites of the pattern rule by substituting
  the stem into the prerequisite pattern.
* If the resulting filename exists or can be made by applying another
  rule, a match is made and the rule is applied.

Examples:

    %: %.mod
        $(COMPILE.mod) -o $@ -e $@ $^
    %: %.cpp
        $(LINK.cpp) $^ $(LOADLIBES) $(LDLIBS) -o $@
    %: %.sh
        cp $< $@
        chmod a+x $@

#### Static Pattern Rules
A static pattern rule is one that applies only to a specific list of
targets:

    $(OBJECTS): %.o: %.c
        $(CC) -c $(CFLAGS) $< -o $@

The `$(OBJECTS) limits the rule to the flies listed in the `$(OBJECT)`
variable.

#### Suffix Rules
Suffix rule consist of one or two suffixes concatenated and used as
target:

    .c.o:
        $(COMPILER.c) $(OUTPUT_OPTION) $<

Is the same as:

    %.o: %.c
        $(COMPILE.c) $(OUTPUT_OPTION) $<

The suffix rule forms the stem ofthe file byremovingthetarget suffix. It forms the prerequisite byreplacing
the target suffix with the prerequisite suffix. The suffixrule is recognized by make only if the two suffixes are
in alist of known suffixes. 

#### Working with Implicit Rules
Using an implicit rule: simply do not specify a command script when adding
your target to makefile. This causes make to search its built-in database
satisfy the target.

A pattern with no command script will remove the rule from make's
database.

#### Rule Structure 
The built-in rules have the standard structure.

Here is the rule for updating an object file:

    %.o: %.c
        $(COMPILER.c) $(OUTPTU_OPTION) $<

The customization of this rule is controlled entirely by the set of
variables it uses:

    CPPFLAGS = -I project/include
    COMPILER.c = $(CC) $(CFLAGS) $(CPPFLAGS) $(TARGET_ARCH) -c
    CC = gcc
    OUTPUT_OPTION = -o $@

If the user wanted a CPP define to the command line, they would normally
invoke make like:

    make CPPFLAGS=-DDEBUG

### Automatically Dependency Generation
There is a option to `gcc` and many other C/C++ compilers that will read
the source and write makefile depencies, for example, here is how we cna
find the dependencies for stdio.h:

    $ echo "#include <stdio.h>" > stdio.c
    $ gcc -M stdio.c
    stdio.o: stdio.c /usr/include/stdio.h /usr/include/_ansi.h \
        /usr/include/newlib.h /usr/include/sys/config.h \
        /usr/include/machine/ieeefp.h /usr/include/cygwin/config.h \
        /usr/lib/gcc-lib/i686-pc-cygwin/3.2/include/stddef.h \
        /usr/lib/gcc-lib/i686-pc-cygwin/3.2/include/stdarg.h \
        /usr/include/sys/reent.h /usr/include/sys/_types.h \
        /usr/include/sys/types.h /usr/include/machine/types.h \

May be write shell script to update dependencies.

By now most versions of make have the include directive and GNU make most
certainly does. 

So the trick is to write a makefile target whose action runs `gcc` over
all your source with the `-M` option, saves the results in a dependency
file, and then re-runs make including the generated dependency file in the
make including the generated dependency file in the make file so it can
trigger the updates we neede. 

Before make, this is exactly what was done and the rule looked like:

    depend: count_words.c lexer.c counter.c
    $(CC) -M $(CPPFLAGS) $^ > $@

Before running make to buiild the program, you would first execute make
depend to generate teh dependencies. 

GNU make solved the forget-to-generate problem with a cool feature adn a
simple algorithm.

Algorithm: if we generated each source file's depencies into its own
dependency file with, say, a `.d` suffix and added the `.d` file itself
as a garget to this depency rule, then the make could know that the `.d`
suffix and added the `.d` file itself as a target to this dependency
rule: 

    counter.o counter.d: src/counter.c include/counter.h include/lexer.h

Generating this rule can be accomplished with a pattern rule and command
script:

    %.d: %.c
        $(CC) -M $(CPPFLAGS) $< > $@.$$$$; \
        sed 's,\($*\)\.o[ :]*,\1.o $@ : ,g' < $@.$$$$ > $@; \
        rm -f $@.$$$$

Now for the cool feature, make will treat any file named in an inlcude
directive as a target to be updated. 

### Managing Libraries
Archives are careated and modified with the `ar` program.

Exmaple:

    ar rv libcounter.a counter.o lexer.o

A library can be lined into an executable in serveral ways.

1. The compiler will use the suffix to do the right thing:
        
        cc count_words.o libcounter.a /lib/libfl.a -o count_words

* With the `-l` option:

        cc count_words.o -lcounter -lfl -o count_words

  When `cc` sees the `-l` optoin it searches for the library in the
  system's standard library directories. The linker will search for a
  shared library (`.so`) first, before searching for an archive.

  The search path can be changed by adding `-L`, these libraries are added
  before the system libraries.

        cc count_words.o -L. -lcounter -lfl -o count_words


## Variables and Macros
Make is sort of two languages in one:

* language describews depency graphs consists of targets and
  prerequisites.
* A macro language for performing textual substitution.

Variable naming convention example:

    # Some simple constants.
    CC := gcc
    MKDIR := mkdir -p
    # Internal variables.
    sources = *.c
    objects = $(subst .c,.o,$(sources))
    # A function or two.
    maybe-make-dir = $(if $(wildcard $1),,$(MKDIR) $1)
    assert-not-null = $(if $1,,$(error Illegal null value.))

The value of a variable consists of all the words to the right of the
assignment symbol with leading space trimmed. Trailing spaces are not
trimmed.

### Variables Types
Two types of variables in make:

* Simply expanded variables
* Recursively expanded variables

A simply expanded variable is defined using `:=` assignment operator:

    MAKE_DEPEND := $(CC) -M

Its rhs is expanded immediately upon reading the line from the makefile.

---

The second type of variable is called a recursively expanded variable. It
is defined using `=` assignmetn operator.

    MAKE_DEPEND = $(CC) -M

Its rhs is simply slurped up my make and stored as value of variable
without evaluating or expanding it any way. Instead, teh expansion is
performed when the variable is used.

### Macros
A macro is just another way of defining a variable in make, and one that
can contain embeded newlines.

    define create-jar
        @echo Creating $@...
        $(RM) $(TMP_JAR_DIR)
        $(MKDIR) $(TMP_JAR_DIR)
        $(CP) -r $^ $(TMP_JAR_DIR)
        cd $(TMP_JAR_DIR) && $(JAR) $(JARFLAGS) $@ .
        $(JAR) -ufm $@ $(MANIFEST)
        $(RM) $(TMP_JAR_DIR)
    endef

We can use it like this: 

    $(UI_JAR): $(UI_CLASSES)
        $(create-jar)

Note that command line prefixed with an `@` character are not echoed by
make when teh command is executed
## Dependencies in detail

In make, dependencies are always listed after the name of target:

    mytarget: dep1 dpe2

Dependencies may be real files or phony targets.

## Managing Large Projects

### Recursive make
Motivation: make works very well within a single directory (or small set
of directories) but becomes more complex when the number of directories grows. So, we can use make to
build a large project by writing a simple, self-contained makefile for each directory , then executing them all
individually . 

Suppose I have an mp3 player application:

    ~/src/MyProject
        |> ---- Makefile
        |> ---- include
        |           |>---- db
        |           |>---- codec
        |           |>---- ui
        |> ---- lib
        |           |>---- db
        |           |>---- codec
        |           |>---- ui
        |> ---- app
        |           |>---- player
        |> ---- doc

Note: A more traditional layout would place the application's main
function and glue in the top directory rather than in the subdirectory
`app/player`

---

If each of the directories `lib/db`, `lib/codec`, `lib/ui` and
`app/player` contains a makefile, then it is the job of the top-level
makefile to invoke them:

    lib_codec := lib/codec
    lib_db  := lib/db
    lib_ui  := lib/ui
    libraries := $(lib_ui) $(lib_db) $(lib_codec)
    player := app/player
    .PHONY: all $(player) $(libraries)
    all: $(player)
    $(player): $(libraries)
    $(lib_ui): $(lib_db) $(lib_codec)

The top-level make file invokes make on each subdirectory through a rule
that lists the subdirectories as targets and whose action is to invoke
make:

    $(player) $(libraries):
        $(MAKE) --directory=$@

The variable `MAKE` should always be used to invoke make within a amke
file. The `MAKE` variable is recognized by make and is set to the actual
path of make so recursive invocation all use the same executable.

The target directories marked with `.PHONY` so the rule fires even though
the target may be up-to-date.

The `--directory` (`-C`) option is used to cause make to change to the
target directory before reading a makefile.

As make is planning the execution of dependency graph, the prerequisites
of a target are independent of one another. In addition, separate targets
with no dependency relationships to one another are also independent.

For example, the libraries have no inherent relationship to `app/player`
target or to each other. 

This means make is free to execute the
`app/player` makefile before building any of the libraries. This would
cause the build to fail since linking the application requires the
libraries.

To solve this, we provide the additional dependency information:

    $(player): $(libraries)
    $(lib_ui): $(lib_db) $(lib_codec)

When the top-level makefile is run, we see:

    $ make
    make --directory=lib/db
    make[1]: Entering directory `/test/book/out/ch06-simple/lib/db'
    Update db library...
    make[1]: Leaving directory `/test/book/out/ch06-simple/lib/db'
    make --directory=lib/codec
    make[1]: Entering directory `/test/book/out/ch06-simple/lib/codec'
    Update codec library...
    make[1]: Leaving directory `/test/book/out/ch06-simple/lib/codec'
    make --directory=lib/ui
    make[1]: Entering directory `/test/book/out/ch06-simple/lib/ui'
    Update ui library...
    make[1]: Leaving directory `/test/book/out/ch06-simple/lib/ui'
    make --directory=app/player
    make[1]: Entering directory `/test/book/out/ch06-simple/app/player'
    Update player application...
    make[1]: Leaving directory `/test/book/out/ch06-simple/app/player'

When make detects that it is invoking another make recursively, it enalbes
the `--print-directory` (`-w`) option, which causes make to print the
entering and exiting directory. The `MAKELEVEL` is printed in square
brackets in each line as well.

### Building Other Targets

    clean: $(player) $(libraries)
        $(MAKE) --directory=$@ clean

This is broken because the prerequisites would trigger a build of the
default target in `$(player)` and `$(libraries)` makefile, not a build of
the clean target.

The following would work:

    $(player) $(libraries):
        $(MAKE) --directory $@ $(TARGET)

By adding the variable `$(TARGET)` to the recursive make line and the
`TARGET` variable on the make command line, we can add arbitrary goals to
sub directory:

    make TARGET=clean

We can set default value for `TARGET`:

    TARGET ?= all

We can take that one step further and derive `TARGET` from `MAKECMDGOALS`:

## C and CPP

### Separating Source and Binary
Make works with multiple directories best when the files is updating live
in the current directory.

#### The Easy Way
The easiest way to get make to place binaries in a separate directory from
sources is to **start the make program from the binary directory**

The output files are accessed using relative paths, while input files must
be found either through explicit paths or through searching through
`vpath`. Start with source directory:

    SOURCE_DIR := ../mp3_player

