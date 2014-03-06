# Similarities 
In package `org.apache.lucene.search.similarities`
## Similarity
All similarities are sub classes of `Similarity`. It defines the components of Lucene scoring, it determines how Lucene weights
terms, and Lucene interacts with Lucene at index time  and query time:
* At index time, the indexer calls `computeNorm(FieldInvertState)`,
  allowing the Similarity implementation to set a per-document value that
  will be later accessible via `AtomicReader#getNormvalues(String)`

  Many formulas require the use of average document length, which can be
  computed via a combination of `CollectionStatistics#sumTotalTermFreq()`
  and `CollectionStatistics#maxDoc()` or `CollectionStatistics#docCount()`
* At query-time with `AtomicReader#getNumericDocValues(String)`. 
  At query time, queries interact with the similarity via these steps:

  1. `computeWeight(float, CollectionStatistics, TermStatistics ...)` is
     called a single time. Allowing the implementation to compute any
     statistics across *entire collection*
  * The query normalization process occurs a single time:
    `Similarity.SimWeight#getValueForNormalization()` is called for each
    query leaf node, `Similarity#queryNorm(float)` is called for the
    top-level query, and finally `Similarity.SimWeight#normalize(float,
    float)`passes down the normalization value and any top-level boosts
  * For each segment in the index, the Query creates a
    `simScorer(SimWeight, AtomicReaderContext)` The `score()` method is
    called for each matching documents

When `IndexSearcher#explain(org.apache.lucene.search.Query, int)` is
called, queries consult the Similarity's DocScorer for an explanation of
how it computed its score

Methods:
* `public float coord(int overlap, int maxOverlap)` Hook to integrate
  coordinate-level matching, by default this is disabled. 
* `queryNorm` compute the normalization value for a query given the sum of
  the normalized weights. 
* `long computeWeight(FieldInvertState state)` computes the normalization
  value for a field.
* `SimScorer simScorer(SimWeight weight, AtomicReaderContext context)`
  creates a new `SimScorer` to score matching documents from a segment of
  the inverted index. `context` is the segment of inverted index to be
  scored

The UML diagram for `DefaultSimilary` (which is used most commonly)
![](diagrams/sim_uml.png?raw=true)
