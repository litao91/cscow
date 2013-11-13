Bolts
=====
Process tuples. 

IRichBolt
---------
Most basic class to implement:

    backtype.storm.topology.IRichBolt

### Details:
* `void execute(Tuple input)`: most important method, called once per
  tuple received.
* The bolt may emit several tuples for each tuple received.
* `declareOutputFields(OutputFieldsDeclarer declarer)`: declare the name
  of the Field that the bolt emit.

**Note**: A bolt or spout can emit as many tuples as needed. When `nextTuple` or
`execute` methods are called, they may emit 0, 1, or many tuples.

A sample execute implementation:

    public void execute(Tuple input) {
        String sentence = input.getString(0);
        String[] words = sentence.split(" ");
        for(String word : words){
            word = word.trim();
            if(!word.isEmpty()){
                word = word.toLowerCase();
                //Emit the word
                collector.emit(new Values(word));
            }
        }
        // Acknowledge the tuple
        collector.ack(input);
    }

* First line: reads value from the tuple. Value ca be read by position or
  by name.
* Value is processed and then emitted using the collector object
* Collector is assigned in the `prepare()` function of a Bolt
* Controller's `ack()` method is called to indicate that the processing
  has completed.
* May call `fail()` on fail.
* The topology finishes when `cleanup()` method is called.

IBasicBolt
----------
Encapsulates the pattern of calling `ack` right after execute the method.
Bolt Lifecycle
--------------
Bolt is a component that takes tuples as input and produces tuples as
output.

1. Bolts are created on the client machine, serialized into the topology, and
submitted to the master machine of the cluster.
* The cluster launches workers that deserialize the bolt, call prepare on
  it, and then start processing tuples.
* To customize a bolt, you should set parameters in its constructor and
  save them as instance variables so they will be 

### Reliable vs Unreliable Bolts
* A topology is a tree of nodes  in which messages (tuples) travel along one
ore more branches.
* Each node will `ack(tuple)` or `fail(tuple)`
* The best way to keep track of the original spout instance is to include
  a reference to the originating spout in the message tuple. (Anchoring)
