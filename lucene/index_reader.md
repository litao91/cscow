# Index Reader
`IndexReader` (`org.apache.lucene.index`) is an abstract class, providing
an interface for accessing an index.  Search of an index is done entirely
through this abstract interface.

Two different types of `IndexReader`s:
* `AutomicReader`: These indexes do not consist of several sub-readers,
  they are atomic. They support retrieval of stored fields, doc values,
  terms and postings. 
* `CompositeReader`: Instances (like `DirectoryReader`) of this reader can
  only be used to get stored fields from the underlying `AtomicReaders`,
  but this is not possible to directly retrieve postings. To do that, get
  the sub-readers via `CompositeReader#getSequentialSubReaders()`.

Important Methods:
* `addReaderClosedListener(ReaderClosedListener listener)`: listeners will
  be invoked when this reader is closed. 
* `registerParentReader(IndexReader reader)`: This method is called by
  `IndexReader`s which wrap other readers `CompositeReader` or
  `FilterAtomicReader` to register the parent at the child.
* `int getRefCount()`: returns the current `refCount` of this `IndexReader`
* `int numDocs()`
* `int maxDoc()`
* `Document document(int docID, Set<String> fieldsToLoad)`
* `IndexReaderContext getContext()`: Returns the root for this sub-reader
  tree.  Iff this reader is composed of sub readers, i.e. this reader
  being a composite reader, this method return a `CompositeReaderContext`
  holding the reader's direct children as well as a view of reader's
  direct children as well as children as well as a view of the reader
  tree's atomic leaf contexts. All sub-`IndexReaderContext` instances
  referenced from this readers top-level context are private to this
  reader and are not shared with another context tree.
* `int docFreq(Term term)`: Returns the number of documents containing the
  `term`. Return 0 if the term or field does not exists. 
* `long totalTermFreq(Term term)`: Returns the total number of occurrences
  of `term` across documents (the sum of the `freq()` for each doc that
  has this term). 
* `long getSumDocFreq(String field)`: Returns the sum of
  `TermsEnum#docFreq()` (returns the number of documents containing the
  current term) for all terms in this field.
* `getDocCount(String field)`: Returns the number of documents that have
  at least one term for this field.
* `getSumTotalTermFreq(String field)`: Returns the sum of
  `TermsEnum#totalTermFreq`(returns the total number of occurrences of
  this term across all documents, that is the sum of the `freq()` for each
  doc that has this term) for all terms in this field

# Atomic Reader
`AtomicReader extends IndexReader` is an abstract class. Search of an
index is done entirely through this abstract interface, so that any
subclass which implements it is searchable.

`IndexReader`s implemented by this subclass do not consist of several
sub-readers, they are *atomic*. They support retrieval of stored fields,
doc values, terms, and postings.

Methods:
* `Fields fields()` return `Fields` for this reader. 
* `NumericDocValues getNumericDocValues(String field)`: Returns
  `NumericDocValues` (a per-document numeric value) for this field. 
* `BinaryDocValues getBinaryDocValues(String field)`
* `SortedDocValues getSortedDocValues(String field)`
