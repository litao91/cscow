# Multimethods
To define a mutimethod, use `defmulti`:
```clojure
(defmulti name dispatch-fn)
```

Or use `class` to create a multimethod called `my-print`:
```clojure
(defmulti my-print class)
```

To add a specific method implementation, use `defmethod`
```clojure
(defmethod name dispatch-val & fn-tail)
```
Example:

```clojure
(defmethod my-print String [s]
  (.write *out* s))

(defmethod my-print nil [s]
  (.write *out* "nil"))
```

