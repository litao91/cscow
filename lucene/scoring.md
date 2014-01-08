# The scoring Algorithm of Lucene

## Introduction
Lucene scoring uses a combination of the *Vector Space Model* of
Information and *Boolean model* to determine how relevant a given Document
is to a User's query.

The idea behind the VSM:
* The more times a query term appears in a document relative to the number
  of ties the term appears in all the documents in the collection, the
  more relevant that document is to the query.
* It uses the Boolean model to first narrow down the documents that need
  to be scored based on the use of boolean logic in the Query
  specification. 
* Some capabilities and refinements onto this model to support boolean and
  fuzzy searching. 

## Algorithm
In the typical search, application, a Query is passed to the Searcher,
beginning the scoring process. 

Once inside the searcher, a Collector is used for scoring and sorting of
the search results. Important objects involved in a search:
1. `Weight` object of the query: the weight object is an internal
   representation of the query that allows the query to be reused by the
   Searcher.
* The searcher that initiated the call.
* A filter for limiting the result set. 
* Sort object for specifying how to sort the results if the standard score
  based sort method is not desired. 
