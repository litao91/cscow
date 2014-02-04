# Reference 
## General

    (apply f args* argseq)
    (true? expr)
    (faluse? expr)
    (nil? expr)
    (zero? expr)
    (get the-map key not-found-val)
    (defrecord name [arguments])
    (defn name doc-string? attr-map? [params*] body)
    (fn [params*] body)
    #(body)
    (let [bindings*] exprs*)
    (resolve sym) ; resolve symbol
    (in-ns name) ; switch namespace
    (import '(pacakge Class+))
    (ns name & references) ; import java classes and require namespaces

    (new classname)
    (. class-or-instance member-symbol & args)
    (. class-or-instance (member-symbol & args))

    (loop [bindings *] exprs*)
    (recur exprs*)

## Sequences
### Creating sequences

| Form                         | purpose                                  |
| ---                          | ---                                      |
| `(range start? end step?)`   | produces a seq from `start` to `end`     |
| `(repeat n x)`               | repeat an element `x` `n` times          |
| `(iterate f x)`              | Infinitely apply f to x                  |
| `(take n sequence)`          | return a lazy seq of the first n items   |
| `(cycle coll)`               | take a collection and cycles infinitely  |
| `(interleave & colls)        | take multiple collections and interleave |
| `(interpose separator coll)` | each element of the input segregated     |
| `(join separator sequence)`  | `Clojure.string/join`                    |
| `(list & elements)`          | create a list                            |
| `(vector & elements)`        | create a vector                          |
| `(hash-set & elements)`      | create a hash set                        |
| `(hash-map key-1 val-1 ...)` | create a hash map                        |
| `(set coll)`                 | expect a collection as first argument    |

### Filtering Sequences 

| Form                     | Purpose                             |
| -----                    | -----                               |
| `(filter pred coll)`     | The most basic filter               |
| `(take-while pred coll)` | take while a predicate remains true |
| `(drop-while pred coll)` | opposite of `take-while`            |
| `(split-at index coll)`  | split the collection into two       |
| `(split-with pred coll)` | split into two with first true      |

### Sequence Predicates

| `(every? pred coll)`     | whehter it is true true for every ele |
| `(some pred coll)`       | the first non false value             |
| `(not-every? pred coll)` |                                       |
| `(not-any? pred coll)`   |                                       |

### Transforming Sequences

| `(map f coll)`              | f on each ele in coll        |
| `(reduce f coll)`           | "total up" a seq             |
| `(sort comp? coll)`         | sort by natural order        |
| `(sort-by a-fn comp? coll)` | sort by the result of `a-fn` |


Sequence comprehension:

    (for [binding-form coll-expr filter-expr? ...] expr)

`for` takes a vector of `binding-form/coll-exprs` plus an option
`filter-expr` and then yields a sequence of `exprs`

Example:

    (for [word ["the" "quick" "brown" fox"]]
      (format "<p>%s</p>" word))

This reads almost like English: “For [each] word in [a sequence of words]
format [according to format instructions].”




