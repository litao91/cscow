Local Mode
=========
The Main Class
--------------
In the main class, we'll create the topology and a `LocalCluster`

Create Topology Example:

    TopologyBuilder builder = new TopologyBuilder();
    builder.setSpout("word-reader",new WordReader());
    builder.setBolt("word-normalizer", new WordNormalizer()).shuffleGrouping("wordreader");
    builder.setBolt("word-counter", new WordCounter()).shuffleGrouping("wordnormalizer");

* Tells how the nodes are arranged and how they exchange data.
* Spout and bolts are connected using `shuffleGrouping`. Tells storm the
  send messages from the source node to target nodes in randomly
  distributed fashion.

Next create a `Config` object containing the topology configuration, which
is merged with the cluster configuration at run time and sent to all nodes
with the `prepare` method.

    Config conf = new Config();
    conf.put("wordsFile", args[0]);
    conf.setDebug(true);

When debug is true, Strom prints all messages exchanged between nodes.

Then create topology and run.

    LocalCluster cluster = new LocalCluster();
    cluster.submitTopology("Getting-Started-Toplogie", conf, builder.createTopology());
    Thread.sleep(2000);
    cluster.shutdown();


