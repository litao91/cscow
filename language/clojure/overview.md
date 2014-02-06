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

## Getting Started
Managed by Leiningen Project management tool:

    cd ~/temp
    lein new my-proj
    cd my-proj
    lein repl # starts up the interactive REPL

## Clojure Syntax

* Lists of lists that can be represented in memory quite naturally as a
  tree.
* `(a b c)` is a call to a function named `a` with arguments `b` and `c`.
* To make this data instead of code, the list needs to be quoted. `'(a b
  c)` or `(quote (a b c))` is a list of the values `a`, `b`, and `c`.

Special cases in Clojure:

| Purpose   | Sugar                | Function                  |
| Comment   | `;text`              | `(comment text)`          |
| Character | `\char \tab \space`  | `(char ascii-code)`       |
| String    | `"text"`             | `(str char1 char2 ...)`   |
| Regex     | `#'pattern'`         | `(re-pattern pattern)`    |
| List      | `'(items)`           | `(list items)`            |
| Vector    | `[items]`            | `(vector items)`          |
| Set       | `#{items}`           | `(hash-set items)`        |
| Map       | `{key-value-pairs}`  | `(hash-map pairs)`        |
| metadata  | `^{k-val-pairs} obj` | `(with-meta obj meta-map` |


## Vars
Clojure provides bindings to Vars, which are container bound to mutable
storage locations.

Types of bindings:
* Global bindings
* thread-local binds
* bindings that are local to a function
* bindings that are local to a given form.


Explanation:

* **Function parameters** are bound to vars that are *local to function*
* `def` binds a value to a symbol
    - define metadata `:dynamic` allows a thread-local value within the
      scope of the binding call, that is, it allws re-definition of
      assigned value.
* `let` binds to the scope within the statement
* `binding` macro is similar to `let`, but it gives new, thread-local
  values to existing global bindings throughout the scope's thread of
  execution

Vars intended to be bound to new, thread-local values using binding have
their own naming convention. These symbols have names that begin and end
with an asterisk. Examples that appear in this article include
`*command-line-args*`, `*agent*`, `*err*`, `*flush-on-newline*`, `*in*`,
`*load-tests*`, and
`*stack-trace-depth*`. Functions that use these bindings are affected by
their values. For example, binding a new value to `*out*` changes the output
destination of the println function.

Demo: 

    (def ^:dynamic v 1)

    (defn f1 []
      (println "f1: v:" v))

    (defn f2 []
      (println "f2: before let v" v)
      (let [v 2]
        (println "f2: in let, v:" v)
        (f1))
      (println "f2: after let v:" v))

    (defn f3 []
      (println "f3: before binding v:" v)
      (binding [v 3]
        (println "f3: within binding function v: " v)
        (f1))
      (println "f3: after binding v:" v))

    (defn f4 []
      (def v 4))

    (println "(= v 1) => " (= v 1))
    (println "Calling f2: ")
    (f2)
    (println)
    (println "Calling f3: ")
    (f3)
    (println)
    (println "Calling f4: ")
    (f4)
    (println "after calling f4, v = " v)

Gives:

    (= v 1) =>  true
    Calling f2: 
    f2: before let v 1
    f2: in let, v: 2
    f1: v: 1
    f2: after let v: 1

    Calling f3: 
    f3: before binding v: 1
    f3: within binding function v:  3
    f1: v: 3
    f3: after binding v: 1

    Calling f4: 
    after calling f4, v =  4

Recap:
* In the first call to `f2`, the `let` function's binding to `v` did not
  change its original declared value.
* Inside `f3` within the scope of binding call, the value of `v` was
  re-assigned within `f1` since `f1` was called within the exec thread of
  binding call's score.

  Once `f3`'s function execution thread exits from the binding call, `v`
  is bound to initially declared binding `1`
* When `f4` is called, the binding of `v` is not within the context of a
  new execution thread so `v` is bound to the new value, in the global
  scope.

## Collections
Clojure provides the collection types list, vector, set and map. All of
them are immutable, heterogeneous and persistent. 

* immutable: their contents cannot be changed
* heterogeneous: can hold any kind of object
* persistent: old versions of them are preserved when new versions are
  created.

### Some functions:
* `count` returns num of items:
    
        (count [19 "yellow" true]) ; -> 3

* `conj` adds one ore more items to a collection
    
        (conj [1] 2 3) ; -> [1 2 3]

* `reverse`

        (reverse [2 4 7]) ; -> (7 4 2)

* `map` applies a given function that takes one parameter to each item in
  a collection, returning a lazy sequence of the results. It can also
  apply functions that take more than one parameter if a collection is
  supplied for each argument.

        (map #(+ % 3) [2 4 7]) ; -> (5 7 10)
        (map + [2 4 7] [5 6] [1 2 3 4]) ; -> 8 12

* `apply` returns the result of a given function when all the items in a
  given collection are used as arguments:

        (apply + [2 4 7]) ; -> 13

* Functions to retrieve items:

        (def stooges ["Moe" "Larry" "Curly" "Shemp"])
        (first stooges)  ; -> "Moe"
        (second stooges) ; -> "Larry"
        (last stooges)   ; -> "Shemp"
        (nth stooges 2)  ; indexes start at 0 -> "Curly"

* Functions retrieve several items:
        (next stooges)                    ; -> ("Larry" "Curly" "Shemp")
        (butlast stooges)                 ; -> ("Moe" "Larry" "Curly")
        (drop-last 2 stooges)             ; -> ("Moe" "Larry")
                                          ; Get names containing more than three characters.
        (filter #(> (count %) 3) stooges) ; -> ("Larry" "Curly" "Shemp")
        (nthnext stooges 2)               ; -> ("Curly" "Shemp")

* Several predicate functions:

        (every? #(instance? String %) stooges)     ; -> true
        (not-every? #(instance? String %) stooges) ; -> false
        (some #(instance? Number %) stooges)       ; -> nil
        (not-any? #(instance? Number %) stooges)   ; -> true

### Lists
Create list:

    (def stooges (list "Moe" "Larry" "Curly"))
    (def stooges (quote ("Moe" "Larry" "Curly")))
    (def stooges '("Moe" "Larry" "Curly"))

Searching a item:

    (some #(= % "Moe") stooges) ; -> true 
    (some #(= % "Mark") stooges) ; -> nil 

    ; Another approach is to create a set from the list
    ; and then use the contains? function on the set as follows.
    (contains? (set stooges) "Moe") ; -> true

While the `conj` function will create a new list, the `cons` function will
create a new sequence. In each case the new item(s) are added to the
front. The remove function creates a new list containing only the items
for which a predicate function returns false. For example:

    (def more-stooges (conj stooges "Shemp"))               ; -> ("Shemp" "Moe" "Larry" "Curly")
    (def less-stooges (remove #(= % "Curly") more-stooges)) ; -> ("Shemp" "Moe" "Larry")

The into function creates a new list that contains all the items in two
lists. For example:

    (def kids-of-mike '("Greg" "Peter" "Bobby"))
    (def kids-of-carol '("Marcia" "Jan" "Cindy"))
    (def brady-bunch (into kids-of-mike kids-of-carol))
    (println brady-bunch)                               ; -> (Cindy Jan Marcia Greg Peter Bobby)

The peek and pop functions can be used to treat a list as a stack. They operate on the beginning or head of the list.

## Vectors
Ordered collections of items. Ideal when new items will be added or
removed from the back.

They are efficient for finding (using `nth`) or changing (`assoc`) items
by index. Function definition specify their parameter list using a vector.

Create Vector:

    (def stooges (vector "Moe" "Larry" "Curly"))
    (def stooges ["Moe" "Larry" "Curly"])

The `get` function retrieves an item from a vector by index (similar to
`nth`), take an optional value to be returned if the index is out of range. 
If not provided `get` will return nil and `nth` will throw exception

    (get stooges 1 "unknown") ; -> "Larry"
    (get stooges 3 "unknown") ; -> "unknown"
    (nth stooges 1 "unknown") ; -> "Larry"

The `assoc` operates on vectors and maps. When applied to a vector, it creates a new vector where
the item specified by an index is replaced. If the index is equal to the number of items in the vector, a new
item is added to the end. If it is greater than the number of items in the vector, an
`IndexOutOfBoundsException` is thrown.

The `subvec` function returns a new vector that is a subset of an existing one that retains the order of the
items. It takes a vector, a start index and an optional end index.

## Sets
Sets are collections of unique items. Create a set:

    (def stooges (hash-set "Moe" "Larry" "Curly"))
    (def stooges #{"Moe" "Larry" "Curly"})
    (def stooges (sorted-set "Moe" "Larry" "Curly"))

The `contains?` function operates on sets and maps:

    (contains? stooges "Moe")

Sets can be used as functions of their items:

    (stooges "Moe") ; -> "Moe"
    (stooges "Mark") ; -> nil
    (println (if stooges person) "stooge" "regular person"))

The `conj` and `disj` do conjunction and disjoint respectively:

    (def more­stooges (conj stooges "Shemp")) ; ­> #{"Moe" "Larry" "Curly" "Shemp"}
    (def less­stooges (disj more­stooges "Curly")) ; ­> #{"Moe" "Larry" "Shemp"}

## Maps
Maps associate keys and values. Often **keywords** are used for map keys.

Create maps:

    (def popsicle-map
        (hash-map :red :cherry, :green :apple,:purple :grape))
    (def popsicle-map
        {:red :cherry, :green :apple, :purple :grape}) ; same as previous
    (def popsicle-map
        (sorted­map :red :cherry, :green :apple, :purple :grape))

Maps can be sued as functions of their keys. In some cases keys can be
used as function of maps:

    (get popsicle-map :green)
    (popsicle-map :green)
    (:green popsicle-map)

Then access items:

    (contains? possicle-map :green) ; -> true
    (keys popsicle-map) ; -> (:red :green :purple)
    (vals popsicle-map) ; -> (:cherry :apple :grape)
    
The `assoc` function operates on maps and vectors. When applied to a map, it creates a new map where
any number of key/value pairs are added. Values for existing keys are replaced by new values. For
example:

    (assoc popsicle-map :green :lime :blue :blueberry) 
    ; -> {:blue :blueberry, :green :lime, :purple :grape, :red :cherry}

The `dissoc` function takes a map and any number of keys. It returns a new map where those keys are
removed

    (dissoc popsicle-map :green :blue) ; ­-> {:purple :grape, :red :cherry}

When used in the context of a sequence, maps are treated like a sequence
of `clojure.lang.MapEntry` objects.

    (doseq [[color flavor] popsicle-map]
      (println (str "The flavor of " (name color)
        " popsicles is " (name flavor) ".")))

The output:

    The flavor of green popsicles is apple.
    The flavor of purple popsicles is grape.
    The flavor of red popsicles is cherry.

The select­keys function takes a map and a sequence of keys. It returns a new map where only those
keys are in the map

    ((select­keys popsicle­map [:red :green :blue]) ; ­> {:green :apple, :red :cherry}select­keys popsicle­map [:red :green :blue]) ; ­> {:green :apple, :red :cherry}

The `conj` function adds all the key/value pairs from one map to another. If any keys in the source map
already exist in the target map, the target map values are replaced by the corresponding source map
values.

Values in maps can be maps, and they can be nested to any depth.

    (def person {
      :name "Mark Volkmann"
      :address {
        :street "644 Glen Summit"
        :city "St. Charles"
        :state "Missouri"
        :zip 63304}
      :employer {
        :name "Object Computing, Inc."
        :address {
          :street "12140 Woodcrest Executive Drive, Suite 250"
          :city "Creve Coeur"
          :state "Missouri"
          :zip 63141}}})

`get-in` function takes a map and a key sequence. It returns the value of
the nested map key at the end of the sequence. The `->` macro and `reduce`
function can also be used for this purpose.

    (get-in person [:employer :address :city]) ; -> "Creve Coeur"
    (-> person :employer :address :city) ; explained below
    (reduce get person [:employer :address :city]) ; explained below

The `->` macro, referred to as the "thread" macro, calls the series of
function, passing the result of each as an argument to the next. The
follow has the same reuslt

    (f1 (f2 (f3 x)))
    (-> x f3 f2 f1)

The `reduce` function takes a function of two arguments, an optional value
and a collection. 

* It begins by calling the function with either the value and the first
  item in the collection or the first two items in the collection if the
  value is omitted. 
* It then calls the function repeatedly with the previous function result
  and the next item in the collection until every itme in the collection
  has been processed.

The `assoc-in` function takes a map, a key sequence and a new value. It returns a new map where the
nested map key at the end of the sequence has the new value.

## Defining Functions
The `defn` function defines a function. Its arguments are:

* the function name, an optional documentation string (displayed by the
  doc macro), 
* the parameter list (specified with a vector that can be empty) and 
* the function body

The result of the last expression in the body is returned.

Function definition must appear before their first use. The `declare`
special form takes any number of functions names and creates forward
declarations that resolve these cases.

    (declare function-names)

Functions can take a *variable number* of parameters. Optional parameters
must appear at the end. They are gathered into a list by adding an `&` and
a name for the list:

    (defn power [base & exponents]
      ; Using java.lang.Math static method pow.
      (reduce #(Math/pow %1 %2) base exponents))
    (power 2 3 4) ; 2 to the 3rd = 8; 8 to the 4th = 4096

Function definitions can contain more than one parameter list and corresponding body. Each parameter list
must contain a different number of parameters. This supports overloading functions based on arity. Often it
is useful for a body to call the same function with a different number of arguments in order to provide
default values for some of them. 

Example:

    (defn parting
      "returns a String parting in a given language"
      ([] (parting "World"))
      ([name] (parting name "en"))
      ([name language]
        (condp = language
          "en" (str "Goodbye, " name)
          "es" (str "Adios, " name)
          (throw (IllegalArgumentException.
            (str "unsupported language " language))))))

**Anonymous functions** have no name. These are often passed as arguments
to a named function.

When an anonymous function is defined using the `fn` special form, the body can contain any number of
expressions. It can also have a name (following "fn") which makes it no longer anonymous and enables it to
call itself recursively.

    (def years [1940 1944 1961 1985 1987])
    (filter (fn [year] (even? year)) years)

When an anonymous function is defined in the short way using `#(...)` , it can only contain a single
expression.

    (println (pair­test #(even? (+ %1 %2)) 3 5)) ; ­-> pass

Overload base on type

    (defmulti what-am-i-class) ; class is the dispatch function
    (defmethod what-am-i-Number [arg] (println arg "is a Number"))
    (defmethod what-am-i String [arg] (println arg "is a String"))
    (defmethod what-am-i :default [arg] (println arg "is something else"))
    (what-am-i 19)      ; ­-> 19 is a Number
    (what-am-i "Hello") ; ­-> Hello is a String
    (what-am-i true)    ; ­-> true is something else

The `complement` function returns a new function that returns opposite
logical true value.

The `comp` function composes a new function by combining existing ones,
they are called from *right to left*:

    (defn times2 [n] (* n 2))
    (defn minus3 [n] (- n 3))
    (def my-composition (comp minus3 times2))
    (my-composition 4) ; 4 * 2 -3 -> 5

The `partial` function creates a new function from an existing one so that
it provides fixed values for initial parameters and calls the original
function. 

    ; note the use of def instead of defn
    (def times2 (partial * 2)
    (times2 3 4) ; 2 * 3 * 4 -> 24

## Java Interoperability
Import:

    (import
      '(java.util Calendar GregorianCalendar)
      '(javax.swing JFrame JLabel))

Tow ways to invoke static method:

    (. Math pow 2 4) ; ­-> 16.0
    (Math/pow 2 4)

Two ways to invoke a constructor to create a java object:

    (import '(java.util Calendar GregorianCalendar))
    (def calendar (new GregorianCalendar 2008 Calendar/APRIL 16)) ; April 16, 2008
    (def calendar (GregorianCalendar. 2008 Calendar/APRIL 16))

Two ways to invoke an instance method on a java object:

    (. calendar add Calendar/MONTH 2)
    (. calendar get Calendar/MONTH) ; ­> 5
    (.add calendar Calendar/MONTH 2)
    (.get calendar Calendar/MONTH) ; ­> 7

The method name appears first is generally preferred.

Call in the chain

    (. (. calendar getTimeZone) getDisplayName) ; long way
    (.. calendar getTimeZone getDisplayName) ; ­> "Central Standard Time"

The `doto` macro is used to invoke many methods on the same object.

    (doto calendar
      (.set Calendar/YEAR 1981)
      (.set Calendar/MONTH Calendar/AUGUST)
      (.set Calendar/DATE 1))
    (def formatter (java.text.DateFormat/getDateInstance))
    (.format formatter (.getTime calendar)) ; ­> "Aug 1, 1981"

`memfn` macro expands to code that allows a Java method to be treaded as a
first class function:

    (println (map #(.substring %1 %2)
               ["Moe" "Larry" "Curly"] [1 2 3])) ; -> (oe rry ly)
    (println (map (memfn substring beginIndex)
               ["Moe" "Larry" "Curly"] [1 2 3])) ; -> same

### Proxies
The `proxy` macro expands to code that creates a Java object that extends
a given Java class and/or implements zero or more Java interfaces.


### Threads
All Clojure functions implement both the `java.lang.Runnable` and
`java.until.concurrent.Callable`.

    (defn delayed­print [ms text]
      (Thread/sleep ms)
      (println text))
    ; Pass an anonymous function that invokes delayed­print
    ; to the Thread constructor so the delayed­print function
    ; executes inside the Thread instead of
    ; while the Thread object is being created.
    (.start (Thread. #(delayed­print 1000 ", World!"))) ; prints 2nd
    (print "Hello") ; prints 1st
    ; output is "Hello, World!

## Conditional Processing
Syntax: `(if condition then-expr else-expr)`, use the `do` special form to
wrap them in a single expression.

    (import '(java.util Calendar GregorianCalendar))
    (let [gc (GregorianCalendar.)
          day­of­week (.get gc Calendar/DAY_OF_WEEK)
          is-weekend (or (= day­of­week Calendar/SATURDAY) (= day­of­week Calendar/SUNDAY))]
      (if is-weekend
        (println "play")
        (do (println "work")
            (println "sleep"))))

The `when` and `when-not` provide alternatives to `if` when only one
branch is needed.

The `if-let` macro binds a value to a single binding and chooses an expression to evaluate based on
whether the value is logically true or false

## Iteration
The `dotimes` macro executes the expression in its body a given number of
times:

    (dotimes [card­number 3]
      (println "deal card number" (inc card­number))) ; adds one to card­number

Example of while loop:

    (while (.isAlive thread)
        (print ".")
        (flush))


##List Comprehension:
Example:

    (def cols "ABCD")
    (def rows (range 1 4)) ; purposely larger than needed to demonstrate :while
    (println "for demo")
    (dorun
      (for [col cols :when (not= col \B)
            row rows :while (< row 3)]
        (println (str col row))))
    (println "\ndoseq demo")
    (doseq [col cols :when (not= col \B)
            row rows :while (< row 3)]
      (println (str col row)))

## Recursion
Clojure doesn't support tail call optimization. One way to avoid this
issue in Clojure is to use the `loop` and `recur` special forms.

Example:

    (defn factorial-1 [number]
      (loop [n number factorial 1]
        (if (zero? n)
          factorial
          (recur (dec n) (* factorial n)))))

The `loop` special form form is like the `let` special form in that they
both establish local bindings. But it also establishes a recursion point
that is the target or calls to `recur`. The bindings specified by `loop`
provide initial values for the local binds. Calls to `recur` cause control
to return to the loop and assign new values to its local binds. `recur`
can only appear as the last call in the `loop`.

Instead of using a `loop`, you can `recur` back to the top of a function.
This make it simple to write a function whose entire body an implicit
`loop`:

    (defn countdown [result x]
        (if (zero? x)
        result
        (recur (conj result x) (dec x))))

## Predicates
Used to test a condition.

## Sequences
Sequences are **logical view of collections.**

**lazy sequence**: a sequence whose items can be the result of function
calls that *aren't evaluated until they are needed*.

Example:

    (map #(println %) [1 2 3])

When run in a REPL, this outputs the values 1, 2 and 3 on separate lines
interspersed with a sequence of three nil s which are the return values
from three calls to the println function. The REPL always fully evaluates
the results of the expressions that are entered. However, when run as part
of a script, nothing is output by this code. This is because the map
function returns a lazy sequence containing the results of applying its
first argument function to each of the items in its second argument
collection. The documentation string for the map function clearly states
that it returns a lazy sequence

The `dorun` and `doall` functions force the evaluation of items in a
single lazy sequence. The `doseq` macro forces the evaluation of items in
one or more lazy sequences. 

`doseq` or `dorun` simply cause the side effects, the results are not
retained. 

`doall` will retain retain the results. It holds teh head of the sequence
which causes the results to be cached and it returns the evaluated
sequence.

`doseq` is typically preferred over the `dorun` because the code is easier
to read.

## Namespaces
Java groups methods in classes and classes in packages. Clojure groups things that are named by symbols
in namespaces. These include Vars, Refs, Atoms, Agents, functions, macros and namespaces themselves

Symbols are used to assign names to functions, macros and bindings.
Symbols are partitioned into namespaces. There is always a current
namespace, initially set to "user", and it is stored in the special symbol
`*ns*`.

Two function to change it, `in-ns` and `ns` function.

The "user" namespace provides access to all the symbols in `clojure.core`
namespace. The same is true of any namespace that is made the default
through use the `ns` macro.

In order to access items that are not in the default namespace they must
be namespce-qualified. This is done by preceding a name with a namesapce
name and a slash.

For example, the `clojure.string` library defines the `join` function. It
creates a string by concatenating a given separator string between teh
string representation of all the items in a sequence. The
namespace-qualified name of this function is `clojure.string/join`.

The `require` function loads Clojure libraries. It takes one or more
quoted namespaces:

    (require 'clojure.string)
    (reauire '[clojure.string :as str])

This merely loads the library. Names in it must still be
namespace-qualified.

The `refer` function makes all the symbols in a given namespace accessible
in the current namespace:

    (refer 'cloure.string)

The `ns` macro is typically used at the top of a source file. It supports
the directives `:require`, `:use` and `:import` that are alternatives to
using their function forms. Using these is preferred over using their
function forms. 

    (ns com.ociweb.demo
      (:require [clojure.string :as su])
      (:use [clojure.math.numeric-tower :only (gcd sqrt)])
      (:import (java.text NumberFormat) (javax.swing JFrame JLabel)))

    (doto (JFrame. "Hello")
      (.add (JLabel. "Hello, world!"))
      (.pack)
      (.setDefaultCloseOperation JFrame/EXIT_ON_CLOSE)
      (.setVisible true))

The `ns` macro sets the current namespace (available as `*ns*` to `name`,
creating the namespace if necessary. The `references` can include
`:import`, `:require` and `:use`

## Metadata
Clojure is a data attached to a symbol or collection that is not realted
to its logical value. Two objects that are logically equal can have
different metadata.

## Macros
Macros are used to add new constructs to the language. They are code that
generates code at real-time

While functions always evaluate all their arguments, macros can decide
which of their arguments will be evaluated.

Suppose there are many places in our code that need to take different
actions based on whether a number is really close to zero, negative or
positive. We want to avoid code duplication. This must be implemented as a
macro instead of a function because only one of the three actions should
be evaluated. The defmacro macro defines a macro.

    (defmacro around-zero [number negative-expr zero-expr positive-expr]
        `(let [number# ~number] ; so number is only evaluated once
            (cond
                (< (Math/abs number#) 1e-15) ~zero-expr
                (pos? number#) ~positive-expr
                true ~negative-expr)))

The back-quote at the beginning of the macro definition prevents
everything inside from ebing evaluated unless it is unquoted. This means
that the contents will appear literally in the expansion, except items
proceed by a tilde (`~`).

To verify that is macro is expanded properly, enter:

    (macroexpand­1
      '(around­zero 0.1 (println "­") (println "0") (println "+")))

## Lazy and Infinite Sequences
Lazy sequences: elements are not calculated until they are needed.


## Forcing Sequences
`doall` forces Clojure to walk the elements of a sequence and returns the
elements as a result:

    (doall coll)

`dorun` walks the elements of a sequence **without** keeping past elements
in memory. As a result, `dorun` can walk collections too large to fit in
memory.

## Seq-ing Regular Expressions
Clojure's regex use `java.util.regex` under the hood.

You can use `re-matcher` to create a Matcher for a regular expression and
a string and then `loop` on `re-find` to iterate over the matches

    (re-matcher regexp string)

Example:

    (let [m (re-matcher #"\w+" "the quick brown fox")]
      (loop [match (re-find m)]
        (when match
          (println match)
          (recur (re-find m)))))


Much better is to use the higher-level `re-seq`:

    (re-seq regexp string)

Example:
    
    (re-seq #"\w+" "the quick brown fox")

## Lazier than Lazy
`comp` is used to *compose* two or more functions:

    (comp f & fs)

Return a new function that applies the right most function to tis
argument, the next-rightmost function to that result and so on.

Example:

    (def count-if (comp count filter))

So:

```clojure
(count-if odd? [1 2 3 4 5])
-> 3
```

It will first do the filter, the filtered result will be counted.

`partial` performs a partial application of a function:

```clojure
(partial f & partial-args)
```

### Curry and Partial Application
When you *curry* a function, you get a new function that takes one
argument and returns the original and returns the original function with
that one argument fixed.

    ;almost a curry
    (defn faux-curry [& args] (apply partial partial args))

## Mutual Recursion
A mutual recursion occurs when the recursion bounces between two or more
functions. Example:

```clojure
(declare my-odd? my-even?)

(defn my-odd? [n]
  (if (= n 0)
    false
    (my-even? (dec n))))

(defn my-even? [n]
  (if (= n 0)
    true
    (my-odd? (dec n))))
```

`my-odd` and `my-even` consume stack frames proportional to the size of
their argument, so they will fail with large numbers.

Solution:
* Converting to self-recursion
* Trampolining a mutual recursion
* Replacing the recursion with laziness
* Shortcutting recursion with memoization

### Convert to self-recursion
You can convert a mutual recursion to a self-recursion by coming up with a
single abstraction that deals with multiple concepts simultaneously.

For example, you can think of oddness and evenness in terms of a single
concept: *parity*. 

```clojure
(defn parity [n]
  (loop [n n par 0]
    (if (= n 0)
      par
      (recur (dec n) (- 1 par)))))
```

Then you can trivially implement `my-odd?` and `my-even?`:

```clojure
    (defn my-even? [n] (= 0 (parity n)))
    (defn my-odd? [n] (= 0 (parity n)))
```

### Trampolining Mutual recursion
A trampoline is like an after-the-fact `recur`, imposed by the *caller* a
function instead of the *implementer*. Since the caller can call more than
one function inside a trampoline, trampolines can optimize mutual
recursion:
    
    (trampoline f & partial-args)

* If the return value is not a function, then a trampoline works just like
  calling the function directly.
* If the return value is a function, then `tramploine` assumes you want to
  call it recursively and calls it for you.

Example:

    (defn trampoine-fibo [n]
      (let [fib (fn fib [f-2 f-1 current]
                  (let [f (+ f-2 f-1)]
                    (if (= n current)
                      f
                      #(fib f-1 f (inc current)))))]
      (cond
        (= n 0) 0
        (= n 1) 1
        :else (fib 0N 1 2))))

Then bounce `trampoline-fibo` on a `trampoline`

    (trampoline trampoline-fibo 9)

Then:

```clojure
(declare my-odd? my-even?)

(defn my-odd? [n]
  (if (= n 0)
    false
    #(my-even? (dec n))))

(defn my-even? [n]
  (if (= n 0)
    true
    #(my-odd? (dec n))))

(trampoline my-even? 1000000)
```

## State
Clojure's reference model clearly separates identities from values. Almost
everything in Clojure is a value. For identities, Clojure provides four
reference types:

* Refs manage *coordinate*, *synchronous* changes to shared state.
* Atoms manage *uncoordinated*, *synchronous* changes to shared state.
* Agents manage *asynchronous* changes to shared state.
* Vars manage *thread-local* state.

Clojure's model for state and identity:

* A *functional model* that has no mutable state. Most of your code will
  normally be in this layer.
* *Reference models* for parts of the application that you find more
  convenient to deal with using mutable state.

### Refs and Software Transactional Memory
Create mutable data by creating a mutable *reference* to an immutable
object. We create a ref with this

```clojure
(ref initial-state)
```

Example: create a reference to current song:

```clojure
(def current-track (ref "Mars, the Bringer of War"))
```
The `ref` wraps and protects access 

To read the contents of the reference:

```clojure
(deref reference) ; -> #'user/current-track
```

The `deref` function can be shortened to the `@` reader macro. 

```clojure
(deref current-track) ; -> "Mars, the Bringer of War"
@current-track        ; -> "Mars, the Bringer of War"
```


You can change where a reference points with `ref-set`:

```clojure
(ref-set reference new-value)
```

Call `ref-set`:
```clojure
(ref-set current-track "Venus, the Bringer of Peace")
; -> java.lang.IllegalStateException: No transaction running
```
Because refs are mutable, you must protect their updates. Instead of lock,
in clojure, you can use a *transaction*. Transaction are wrapped in a
*docync*:

```clojure
(docsync & exprs)
```

So wrap your `ref-set` with `dosync`:
```clojure
(dosync (ref-set current-track "Venus, the Bringer of Peace"))
```

### alter
More complex example, where transactions need to update existing
information. A simple chat application:
```clojure
(defrecord Message [sender text])
(user.Message. "Aaron" "Hello") 
;-> #:user.Message{:sender "Aaron", :text "Hello"}
(def message (ref ()))
```

Clojure's `alter` will apply an update function to a reference object
within a transaction:

```clojure
(alter ref update-fn &args...)
```
`alter` returns the new value of the ref.

So we use:

```clojure
(defn add-message [msg]
  (dosync (alter messages conj msg)))
```

Notice that 
```clojure
(cons item sequence)
(conj sequence item)
```

The `alter` function calls its `update-fn` as follow:
```clojure
(your-func thing-that-gets-updated & optional-other-args)
```

### commute
`communte` is a specialized variant of `alter` allowing for more
concurrency:
```clojure
(commute ref update-fn &args...)
```
Updates must be able to occur in nay order (commutative).
`commute` returns the new value of the ref. However, the last
in-transaction value you see from a `commute` will not always match the
end-of-transaction value of ref, because of reordering.

### Adding Validation to Refs
We can specify a validation function when creating a ref:

```clojure
(ref initial-state options*)
; options include:
; :validator validate-fn
; :meta metadata-map
```

Example:
```clojure
(def  validate-message-list
  (partial every? #(and (:sender %) (:text %)))
(def message (ref () :validator validate-message-list))

(add-message "not a valid message")
;-> java.lang.IllegalStateException: Invalid reference state

@messages
-> ()
```

### Use Atoms for Uncoordinated, Synchronous Updates
Atoms are lighter-weight mechanism than refs. Where multiple ref updates
can be coordinated in a transaction, atoms allow updates of a single
value:
```clojure
(atom initial-state options?)
;optionsinclude:
; :validatorvalidate-fn
; :metametadata-map
```

Atoms do not participate in transaction and thus do not require a
`docsync`:
```clojure
(reset! an-atom newval)
```

`swap!` updates `an-atom` by calling function `f` on the current value of
`an-atom`, plus any additional args:
```clojure
(swap! an-atom f &args)
```

### Agents for Asynchronous Updates
You can create an agent by wrapping some piece of initial stae:
```clojure
(agent initial-state)
```

Once you have an agent, you can `send` the agent a function to update its
state. `send` queues an `update-fn` to run later, on a thread in a thread
pool:

```clojure
(send agent update-fn & args)
```
The call to `send` does not return the new value, returning instead the
agent itself. That is because send does not know the new value. You can
check the current value of an agent with `deref/@`.

If you want to be sure that the agent has complted the action you sent to,
you can call `await` or `await-for`:
```clojure
(await & agents)
(await-for time-millis & agents)
```
These will case the current thread to block until all actions sent from
the current thread or agent have completed.

Agent also take validation functions:
```clojure
(agent initial-state options*)
;optionsinclude:
; :validatorvalidate-fn
; :metametadata-map
```

To discover the error:
```clojure
(agent-errors agent)
```
You make agent usable again by calling `clear-agent-errors`:
```clojure
(clear-agent-errors agent)
```

`send-off` is a variant of `send` for actions that expect to block.

### Per-Thread State with Vars
When you call `def` or `defn`, you create a *dynamic var*, or just `var`. 
In all  the  examples  so  far  in  the  book,  you  pass  an  initial
value  to def,  which becomes the root binding for the var. 

For example, create a root binding for `foo` of 10:

```clojure
(def ^:dynamic foo 10)
```

However, you can create a `thread-local` binding:
```clojure
(binding [bindings] & body)
```
Bindings have dynamic scope. In other words, a binding is visible anywhere
a  thread’s  execution  takes  it,  until  the  thread  exits  the  scope
where  the binding began. A binding is not visible to any other threads.

#### Acting at a Distance
Vars intended for dynamic binding are sometimes called special variables.
It is good style to name them with leading and trailing asterisks. (e.g.
`*in`, `*out*`, and `*err`).

Clojure provides `memoize`, which takes a function and return a
memorization of a function
```clojure
(memoize function)
```

By dynamically rebinding a function such as slow-double, you change the
behavior of other functions such as calls-slow-doublewithout their knowledge or
consent. With lexical binding forms such as let, it is easy to see the entire
range of your changes. Dynamic binding is not so simple. It can change the
behavior of other forms in other files, far from the point in your source where
the binding occurs.

### Working with java Callback APIs
Clojure provides the `set!` special form a thread-local dynamic binding:
```clojure
(set! var-symbol new-value)
```
