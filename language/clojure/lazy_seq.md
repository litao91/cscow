# Lazy Sequence
A `lazy-seq` call just executes the body once the first time it is
accessed, then caches and return the same result when it is called again.

If you want to use this to build long or even infinite sequence, thenyou
need to recursively nest other lazy-seq calls in the return sequence. Here
is the example:

```clojure
(defn ints-from [n]
  (cons n (lazy-seq (ints-from (inc n)))))

(take 10 (ints-from 7)) ;=> 7 8 9 10 11 12 13 14 15 16
```

Any `(ints-from n)` call produces a sequence starting with `n` followed by
a lazy sequence of `(ints-from (inc n))`. It's an infinite list, but
that's not a problem because the `lazy-seq` ensures that `(int-from (inc
n))` only gets called when it is needed.
