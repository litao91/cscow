# Sample Code
The implementation of `partition-by`
```clojure
(defn partition-by
  "Applies f to each value in coll, splitting it each time f returns
   a new value.  Returns a lazy seq of partitions."
  {:added "1.2"
   :static true}
  [f coll]
  (lazy-seq
   (when-let [s (seq coll)]
     (let [fst (first s) ; first value
           fv (f fst) ; apply test function on the first value
           ; keep doing cons
           run (cons fst (take-while #(= fv (f %)) (next s)))]
       (cons run (partition-by f (seq (drop (count run) s))))))))
```
