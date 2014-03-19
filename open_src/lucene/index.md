# Index
## Posting APIs
Logic relationships:

* A document has several `Field`s, which is a session of data
* Each `Field` of each document has several terms.

`Terms` returned by `Filed`

### Fields
`Fields` is the initial entry point into the postings APIs, 

```java
Fields fields = reader.fields();
Fields fields = MultiFields.getFields(reader);
Fields fields = reader.getTermVectors(docId);
```


You can enumerate the list of fields:

```java
for (String field : fields) {
    Terms terms = fields.terms(field);
}
```

Note, fields is an implementation of `Iterable<String>`. A `Field` is a
**section of a Document**. Each filed has three parts: name, type and
value. 

### Terms
`Terms` represents the **collection of terms in a field**.

```java
//metadata about the field
System.out.println("position? " + terms.hasPositions()); 
System.out.println("offsets? " + terms.hasOffsets());
System.out.println(payloads? + terms.hasPayLoads());
// iterate through terms
TermsEnum termsEnum = terms.iterator(null);
BytesRef term = null;
while ((term = termsEnum.next()) != null) {
  doSomethingWith(termsEnum.term());
}
```

Note: 

* `hasFreqs()` returns true if document in this field store per-document
  term frequency.
* `hasOffset()` True if store offsets(Start and end offset of a Token).
* `hasPosition()` true if stores position
* `hasPayloads()` true if stores payload

### Documents
`DocsEnum` is an extension of `DocIdSetIterator` that **iterates over the
list of documents for a term** , with the term frequency within that
document

```java
int docid;
while((docid = docsEnum.nextDoc()) != DocIdSetIterator.NO_MORE_DOCS) {
    System.out.println(docid);
    System.out.println(docsEnum.freq());
}
```

Note that `DocsAndPositionsEnum` is an extension of `DocsEnum` that
additionally allows iteration of the positions a term occurred within the
document, and any additional per-position information (offsets and
payload).

## Index Statistics
### Term statistics
* `TermsEnum.docFreq()`: the number of documents that contain at least one
  occurrence of the term.
* `TermsEnum.totalTermFreq()`: the number of occurrences of this term
  across all documents.

### Field statistics

* `Terms.size()`: num of unique terms in the field.
* `Terms.getDocCount()`: number of documents that contain at least one
  occurrence of any term for this field.
* `Terms.getSumTotalTermFreq()`: number of tokens for the field.

## Document Statistics
Document statistics are available during the indexing process for an
indexed field: typically a `Similarity` implementation will store some of
these values.

Note: `FieldInvertState` track the number and position / offset parameters
of terms being added to index.

* `FieldInvertState.getLenght()`: num of tokens for this field in the
  documents.
* `FieldInvertState.getNumberOverlap()`: num of tokens for this field in
  the document that had a position increment of zero.
* `FieldInvertState.getUniqueTermCount()`
* `FieldInvertState.getMaxTermFrequency()`

Note, the constructor:

```java
FieldInvertState(String name);
```

Creates `FieldInvertState` for the specific field name.
