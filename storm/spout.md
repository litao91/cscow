Spout
=====
Information source, it's a information generator in Storm topology.
Generally it will read a data source from outside 

IRichSpout
----------
When writing topologies, IRichBolt and IRichSpout are the main interfaces
to use to implement components of the topoloty


    import backtype.storm.spout.ISpout;

    /**
     * When writing topologies using Java, {@link IRichBolt} and {@link IRichSpout} are the main interfaces
     * to use to implement components of the topology.
     *
     */
    public interface IRichSpout extends ISpout, IComponent {

    }

### Details

* `open()`: The first method called in any spout is:
    `public void opne(Map conf, TopologyContext context,
    SpoutOutputCollector collector`
    - `TopologyContext`: All our topology data
    - `conf` object: created in the topology definition
    - `SpoutOutputController`: enables us to emit the data that will be
      processed by the bolts.
* `nextTuple()`: emit values to be processed by the bolts. Called
  periodically from the same loop as `ack()` and `fail()` methods. It must
  release control of the thread when there is no work to do so that the
  other methods have a chance to be called.

ISpout
------
Core Interface for implementing spouts. 

* Feeding messages into topology for processing.
* Strom will track the DAG of tuples generated based on a tuple emitted by
  the spout.
* When Storm detects that every tuple in that DAG has been successfully
  processed, it will send an ack message to the Spout.

### Details

* `close()`: Called when ISpout is **going to be shutdown**. No guarantee
  that it will be called
* `activate()`: out of `deactivate` mode. Meaning that `nextTuple` will be
  called on this spout soon
* `deactivate()`: `nextTuple` will not be called while a spout is
  deactivated.
* `ack(msgId)` 
* `fail(msgId)`: typically put the message back on the queue



SpoutOutputCollector
--------------------
* Expose the API for emitting tuples from an IRichSpout
* Spout can tag messages with ids so that they can be acked or failed
  later on.

Reliable versus Unreliable Messages
----------------------------------
In storm, it is the author's responsibility to guarantee message
reliability
- Reliable topology must manage the lost messages, which requires more
  resources
- A less reliable topology may lose some messages, but is less
  resource-intensive.

Manage reliability at the spout:
1. Include a message ID with the tuple at *emit* time.
* The methods `ack` and `fail` are called when a tuple is proceed
  correctly or fails
    - Tuple processing succeeds when the tuple is processed by all the
      target bolts and all anchored bolts.

