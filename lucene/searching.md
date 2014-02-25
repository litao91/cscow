# The Search
This doc show the basic searching process of Lucene

## The process of `TermQuery`
1. Create Reader and searcher with 

   ```Java
   IndexReader reader = DirectoryReader.open(Directory directory);
   IndexSearcher searcher = new IndexSearcher(reader);
   ```
* In `IndexSearcher`, the `IndexSearcher searcher` call `public TopDocs search(Query query, int nDocs)`

        TopDocs results = new searcher.search(parser.parse(str), 20)
* `search(Query query, int n)` will then call `public search(Query query,
  Filter filter, int n)`
* It will then call the low-level search Implementation:
        
        protected TopDocs search(Weight weight, ScoreDoc after, int nDocs)

* For single thread case (`executor == null`), it will then call 

        protected TopDocs search(List<AtomicReaderContext> leaves, Weight
                                weight, ScoreDoc after, int nDocs)

  The `leaves` argument uses the `protected final List<AtomicReaderContext
  leafContexts` declared in `IndexSearcher`. This variable is initialized
  in the construction time, get from the passed `IndexReader`.
  (`IndexReader.getContext().leaves()`)
* It will then creates a `TopScoreDocCollector`, and call 
        
        protected void search(List<AtomicReaderContext> leaves, Weight
                            weight, Collector collector)

  In this method, `Collector.collect(int)` is called for every document.
  This method executes the searches on all given leaves exclusively. To
  search across all the searchers, leaves use `leafContexts`.

  Inside the function (deleted the exception handling)

        protected void search(List<AtomicReaderContext> leaves, Weight
                            weight, Collector collector) {
            for(AtomicReaderContext ctx : leaves {
                collector.setNextReader(ctx);
                Scorer scorer = weight.scorer(ctx,
                                        !collector.acceptsDocsOutOfOrder(), true);
                scorer.score(collector);
            }
        }

* `Scorer.score(Collector collector)` will score and collect all matching
  documents

        public void score(Collector collector) throws IOException {
            collector.setScorer(this);
            int doc;
            while ((doc = nextDoc()) != NO_MORE_DOCS) {
                 collector.collect(doc);
            }
        }

    And the `collect()` method: (deleted special case checking for readability)
        
        @Override
        public void collect(int doc) throws IOException {
            float score = scorer.score(); // setted by setScorer(this)
            totalHits++;
            if (score < pqTop.score) {
                // Doesn't compete w/ bottom entry in queue
                return;
            }
            doc += docBase;
            pqTop.doc = doc;
            pqTop.score = score;
            pqTop = pq.updateTop();
        }

  Note that in this case, the concrete class of Scorer is `TermScorer`,
  where the `nextDoc()` is implemented. 

  The collector is of type `TopScoreDocCollector`, and the `collect`
  method is implemented in `OutOfOrderTopScoreDocCollector`, in which the
  `collect` function will update `PriorityQueue<T> pq` (priority queue) that defined in
  `TopScoreDocCollector`. `collect()` is called for each document that
  match the query.

  So the document is actually collected in the `score` function.

* The `nextDoc()` method of `TermScorer` relies on the
  `DocEnum`, The `DocEnum` is gotten in `TermWeight.scorer()`
  (`TermWeight` is a subclass of `Weight`). An
  implementation of `TermQuery#scorer`:
        
        public Scorer scorer(AtomicReaderContext context, boolean scoreDocsInOrder,
            boolean topScorer, Bits acceptDocs) throws IOException {
          final TermsEnum termsEnum = getTermsEnum(context);
          if (termsEnum == null) {
            return null;
          }
          DocsEnum docs = termsEnum.docs(acceptDocs, null);
          assert docs != null;
          return new TermScorer(this, docs, similarity.simScorer(stats, context));
        }

  In function `getTermsEnum()`:

        final TermsEnum termsEnum = context.reader().terms(term.field()).iterator(null);
        termsEnum.seekExact(term.bytes(), state);
        return termsEnum;
        
  So it will basically get the context with respect to the terms store in
  the `Weight` (which is in turn generated from `Query`).
* The `Scorer` Make use of `Similarity.SimScorer.docScorer` to actually do the
  scoring. 

## Boolean Query
1. For boolean Query, we still enter the search function:

        protected void search(List<AtomicReaderContext> leaves, Weight
                            weight, Collector collector) {
            for(AtomicReaderContext ctx : leaves {
                collector.setNextReader(ctx);
                Scorer scorer = weight.scorer(ctx,
                                        !collector.acceptsDocsOutOfOrder(), true);
                scorer.score(collector);
            }
        }

    The `weight` here is now of type `BooleanWeight`, defined in
    `BooleanQuery.java`.
* `BooleanWeight.scorer()`: (deleted checking for readability)

        @Override
        public Scorer scorer(AtomicReaderContext context, boolean scoreDocsInOrder,
            boolean topScorer, Bits acceptDocs)
            throws IOException {
          List<Scorer> required = new ArrayList<Scorer>();
          List<Scorer> prohibited = new ArrayList<Scorer>();
          List<Scorer> optional = new ArrayList<Scorer>();
          Iterator<BooleanClause> cIter = clauses.iterator();

          // The weights here are sub terms, may be TermWeight
          for (Weight w  : weights) {
            BooleanClause c =  cIter.next();
            Scorer subScorer = w.scorer(context, true, false, acceptDocs);
          }

            //omit lots of checks
          return new BooleanScorer2(this, disableCoord, minNrShouldMatch, required, prohibited, optional, maxCoord);
        }

* The `BooleanScorer2.score(Collector)` scores and collects all matching documents:

        @Override
        public void score(Collector collector) throws IOException {
            collector.setScorer(this);
            while ((doc = countingSumScorer.nextDoc()) != NO_MORE_DOCS) {
              collector.collect(doc);
            }
        }

* The `score()` function of `BooleanScorer2` is called in `Collector` as
  above. The `score()` function make use of the `countingSumScorer` to
  calculate the score.
* The `countingSumScorer` will basically accumulate each sub scorer

        @Override
        public float score() throws IOException {
            coordinator.nrMatchers = 0;
            float sum = countingSumScorer.score();
            return sum * coordinator.coordFactors[coordinator.nrMatchers];
        }
  
  The counting scorer will basically do the scoring. 

## Details
* `Filter` Abstract class for restricting which documents may be returned
  during searching.
* `Weight`: The purpose of Weight is to ensure searching does not modify a
   `Query`, so that a `Query` instance can be reused. `IndexSearcher`
   dependent state of query should reside in the `Weight`. `AtomicReader`
   dependent state should reside in `Scoreer`

   Since `Weight` creates `Scorer` instances for a given
   `AtomicReaderContedt`, callers must maintain the relationship between
   the searcher's top-level `IndexReaderContext` and the context used to
   create a `Scorer`.

* `Scorer`: A Scorer iterates over documents matching a query in
  increasing order of doc Id. Document scores are computed using a given
  `Similarity` implementation. 

## The scoring
1. `TermsEnum` is Iterator to step through terms to obtain `docFreq`.
   `TermsEnum.docs()` will get `DocEnum` for current term. The 
* The `DocsEnum` is generated for current term. We can iterate over
   documents and term frequencies
