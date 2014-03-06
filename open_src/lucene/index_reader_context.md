# Index Reader Context
`IndexReaderContext` is A struct like class that represents a hierarchical
relationship between instances. 

* `IndexReader reader()`: return the `IndexReader` this context represents
* `List<AtomicReaderContext> leaves()` Returns the context's leaves if
  this context is a top-level context

# Atomic Reader Context
`AtomicReaderContext extends IndexReaderContext`
