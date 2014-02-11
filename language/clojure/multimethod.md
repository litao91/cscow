# Multimethods
To define a mutimethod, use `defmulti`:
```clojure
(defmulti name dispatch-fn)
```

* `name` is the name of the new multimethod.
* Clojure will invoke `dispatch-fn` against the method arguments to select
  one particular implementation of the multimethod.

Consider implementing a generic printing function: The `dispatch-fn` needs
to be a function one argument that returns the type of that argument.

Clojure has a built-in function to match this description called `class`.

```clojure
(defmulti my-print class)
```
At this point, you have provide a description of **how the multimethod
will select a specific method** but no actual specific methods.

To add a **specific method implementation**, use `defmethod`

```clojure
(defmethod name dispatch-val & fn-tail)
```
* `name` the name of the multimethod to which an implementation belongs.
* Clojure matches the `dispatch-fn` with `dispatch-val` to select a
  method.
* `fn-tail` contains arguments and body form just like a normal function

Example:
```clojure
(defmethod my-print String [s]
  (.write *out* s))

(defmethod my-print nil [s]
  (.write *out* "nil"))
```

## Multimethod Defaults
You can use `:default` as a dispatch value to handle any method that not
match anything more specific. 

Using `:default`, create a `my-print` that prints the Java `toString`
value of objects
```clojure
(defmethod my-print :default [s]
  (.write *out* "#<")
  (.write *out* (.toString s))
  (.write *out* ">"))
```

In the unlikely event that `:default` already has some specific meaning in
your domain, you can create a multi-method using this alternative
signature:
```clojure
(defmulti name dispatch-fn :default default-value)
```

Example:
```clojure
(defmulti my-print class :default :everything-else)
(defmethod my-print my-print :everything-else [_]
  (.write *out* "Not implemented yet..."))
```
## Moving beyond Simple Dispatch
If we have the following defintion:
```clojure
(defmethod my-print java.util.Collection [c]
  (.write *out* "(")
  (.write *out* (str/join " " c))
  (.write *out* ")"))

(defmethod my-print clojure.lang.IPersistentVector [c]
  (.write *out* "[")
  (.write *out* (str/join " " c))
  (.write *out* "]")
```
Then when you call:
```clojure
(my-print [1 2 3])
```
It will complain that Multiple methods match dispatch value.

You can create conflicts, and you can resolve them with `prefer-match`:

```clojure
(prefer-method multi-name loved-dispatch dissed-dispatch)
```
When you call `prefer-method` for a multimethod, you tell it to prefer the
`love-dispatch` value over the `dissed-dispatch` value whenever there is
conflict.

Example:
```clojure
(prefer-method
  my-print clojure.lang.IPersistentVector java.util.Collection)
```
## Ad Hoc Taxonomies
Example: using `tag` to distinguish saving and checking account.

```clojure
(ns exmaples.multimethods.account)
(defstruct account :id :tag :balance)
```
Now you are going to create two different checking accounts, tagged as
`::Checking` and `::Saving`. 

Note:
```clojure
:Checking ;=> :Checking
::Checking ;=> :user/Checking
```
Placing keywords in a namespace helps prevent name collisions with other
people's code.

```clojure
(alias 'acc' 'example.multimethods.account)
(def test-savings (struct account 1 ::acc/Savings 100M))
```

Create multimethod:
```clojure
(defmulti interest-rate :tag)
(defmethod interest-rate ::acc/Checking [_] 0M)
(defmethod interest-rate ::acc/Saving [_] 0.05M)
```
