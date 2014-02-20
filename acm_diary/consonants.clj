; problem addr:
; https://code.google.com/codejam/contest/2437488/dashboard
(require '[clojure.string :as string])

(def vowels (hash-set \a \e \i \o \u))

(defn lazy-seq-pairs
  [lst]
  (let [lst-len (count lst)]
    (cond 
      (= lst-len 0) '()
      (odd? lst-len) (do (println "error") '())
      :else
      (lazy-seq
        (cons `(~(first lst) ~(second lst)) 
                (lazy-seq-pairs (nnext lst)))))))


(defn readproblem 
  "return a lazy list of ((term1 n1) (term2 n2))"
  [fname]
  (let [instr (slurp fname)]
      (lazy-seq-pairs
        (rest (string/split instr #"\s")))))

(defn nested-con
  [start end n len]
  (reduce #(+ %1 1 (- len %2 n))  ; sum + (len - start -n) + 1
          0
          (range start (+ (- end n) 2))))


(defn solve-problem
  [problem]
  (let [indexed-term (map list (seq (first problem)) (range))
        len (count indexed-term)
        n (Integer. (second problem))
        term-par (partition-by #(vowels (first %1)) (seq indexed-term))
        con-cons (filter
                   #(and (not (vowels (-> %1 first first))) (>= (count %1) n))
                   term-par)
        con-cnt (map count con-cons)
        cons-start-end (map #(list (-> %1 first second) 
                                  (-> %1 last second)) con-cons)] ; start and ends of con-cons
    (loop [substr-start-idx 0  start-end-lst cons-start-end sum 0]
      (if (empty? start-end-lst) 
        sum
        (do
          (let [curr-con (first start-end-lst) 
                curr-start (first curr-con)
                curr-end (second curr-con)
                current-val 
                (+ 
                  (* (- (first curr-con) substr-start-idx)
                     (+ (- len curr-start n ) 1)) 
                  (nested-con curr-start curr-end n len)) 
                end-idx (+ 2 (- curr-end n))]
            ;(println end-idx)
            ;(println (- (first curr-con) substr-start-idx)
                     ;(+ (- len curr-start n ) 1)) 
            ;(println (nested-con curr-start curr-end n len)) 
            (recur end-idx (rest start-end-lst) (+ sum current-val))))))))



(let [problems (readproblem (second  *command-line-args* ))]
  ;(println (solve-problem (first problems))))
  (doseq [problem (map list problems (range))]
    (print (format "Case #%d: %d\n" 
                   (+ (second problem) 1)
                   (solve-problem (first problem))))))


