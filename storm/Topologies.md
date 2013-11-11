Topologies
==========
Stream Grouping
---------------
Defining how data is exchanged between components.
* Specifies which stream(s) are consumed by each `bolt` and how the stream
  will be consumed
* A node can emit more than one stream of data. A stream grouping allows
  us to choose which stream to receive.

Example:

    builder.setBolt("word-normalizer", new WordNormalizer())
        .shuffleGrouping("word-reader");

* A stream grouping takes the source component ID as parameter.
* There can be more than one source per `InputDeclarer`, and each source
  can be grouped with different stream grouping.

Different groupings:
* **Shuffle Grouping**: takes the source component as parameter, and sends
  each tuple emitted by the source to a randomly chosen bolt. Warranting
  that each consumer will receive the same number of tuples. Useful for
  *atomic* operations.
* **Fields Grouping**: It guarantee that a given set of values for a
  combination of fields is always  sent to the same bolt. In word count
  example, if you group the stream by word field, the word-normalizer wil
  always send tuples with a given word to the same instance of the
  `word-counter` bolt.
* **All Grouping**: send a single copy of each tuple to all instances of
  the receiving bolt. Send *signals* to bolts.
* **Custom Grouping**: Create your own grouping by implementing the
  `backtype.storm.grouping.CustomStreamGrouping`.

