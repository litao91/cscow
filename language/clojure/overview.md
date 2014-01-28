# Clojure Overview
Each "operation" in Clojure is implemented as either

* a function
* macro
* special form

Clojure provides many functions that make it easy to operate on
"sequences" which are logical views of collections. Many things can be
treated as sequences. These include Java collections, Clojure-specific
collections, strings, streams, directory structures and XML trees. New
instances of Clojure collections can be created from existing ones in an
efficient manner because they are persistent data structures.

A java function call like this:

    methodName(arg1, arg2, arg3);

A clojure function call:

    (function-name arg1 arg2 arg3)

Defining a function in Clojure:

    (defn hello [name]
        (println "Hello," name))

Equivalent to:

    public void main(String name) {
        System.out.println("Hello, " + name);
    }

# Getting Started
Managed by Leiningen Project management tool:

    cd ~/temp
    lein new my-proj
    cd my-proj
    lein repl # starts up the interactive REPL

# Clojure Syntax

* Lists of lists that can be represented in memory quite naturally as a
  tree.
* `(a b c)` is a call to a function named `a` with arguments `b` and `c`.
* To make this data instead of code, the list needs to be quoted. `'(a b
  c)` or `(quote (a b c))` is a list of the values `a`, `b`, and `c`.

Special cases in Clojure:

| Purpose           | Sugar             | Function                |
| -------------     | :-------------:   | -----:                  |
| Comment           | ;text             | `(comment text)`        |
| Character literal | \char \tab \space | `(char ascii-code)`     |
| String            | "text"            | `(str char1 char2 ...)` |




